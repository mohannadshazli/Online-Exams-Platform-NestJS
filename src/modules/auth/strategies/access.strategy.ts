import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { type Cache } from 'cache-manager';

// strategies/jwt.strategy.ts
@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(req: Request, payload: any) {
    const authHeader = req.headers['authorization'] as string;
    const accessToken = authHeader?.replace('Bearer', '').trim();
    const isBlacklisted = await this.cacheManager.get(
      `blacklist_${accessToken}`,
    );

    if (isBlacklisted) {
      throw new UnauthorizedException('This account has been logged out');
    }
    return {
      ...payload,
      accessToken,
    };
  }
}
