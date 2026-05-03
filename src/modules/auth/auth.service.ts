import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { compare, hash } from '../../common/utils/bcrypt.util';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../common/constants/user-role.constant';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async register(registerDto: RegisterDto) {
    registerDto.password = await hash(registerDto.password);
    console.log(registerDto.password);
    return this.usersService.create(registerDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    const isPasswordValid = await compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user.id, user.email, user.role);
  }

  async generateTokens(userId: number, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES as any,
      }),
    ]);

    await this.usersService.updateRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  async generateAccessToken(userId: number, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES as any,
    });

    return { accessToken };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findOne(userId);

    if (!user || !user.hashed_refresh_token)
      throw new ForbiddenException('Access Denied');

    const isMatch = await compare(refreshToken, user.hashed_refresh_token);

    if (!isMatch) throw new ForbiddenException('Access Denied');

    return this.generateAccessToken(user.id, user.email, user.role);
  }

  async logout(sub: number, accessToken: string, exp: number) {
    const currentTime = Math.floor(Date.now() / 1000);
    const secondsLeft = exp - currentTime;

    if (secondsLeft > 0) {
      await this.cacheManager.set(
        `blacklist_${accessToken}`,
        'true',
        secondsLeft * 1000,
      );
    }

    await this.usersService.updateRefreshToken(sub, null);

    return 'Logged out successfully';
  }
}
