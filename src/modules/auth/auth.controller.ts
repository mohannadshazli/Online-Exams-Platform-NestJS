import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { RefreshAuthGuard } from './guards/refresh-token.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request / Validation Error.' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.login(loginDto);

    // إعداد الـ Refresh Token في Cookie
    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true, // يمنع وصول الـ JavaScript للتوكن (حماية ضد XSS)
      secure: false, // يشتغل فقط مع HTTPS (فعلها في الـ Production)
      sameSite: 'strict', // يمنع إرسال الكوكيز في طلبات الـ Cross-site
      maxAge: 7 * 24 * 60 * 60 * 1000, // المدة بالـ milliseconds (مثلاً 7 أيام)
    });

    return {
      access_token: tokens.accessToken,
    };
  }

  @ApiBearerAuth()
  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh user tokens' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  refresh(
    @GetUser('sub') id: number,
    @GetUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(id, refreshToken);
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  logout(
    @GetUser('sub') id: number,
    @GetUser('accessToken') accessToken: string,
    @GetUser('exp') exp: number,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.clearCookie('refresh_token');
    return this.authService.logout(id, accessToken, exp);
  }
}
