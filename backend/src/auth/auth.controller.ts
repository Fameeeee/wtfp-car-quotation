import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() staffData: any) {
    return this.authService.register(staffData);
  }

  @Post('login')
  async login(@Req() req: Request, @Res() res: Response, @Body('email') email:string, @Body('password') password: string) {
    // service will create token; we set it as httpOnly cookie here
    const result = await this.authService.login(email, password);
    const token = result.access_token;
    // Determine cookie flags: prefer SameSite=None and Secure when origin is https
    const origin = req.get('origin') || '';
    const isHttpsOrigin = origin.startsWith('https://');
    const cookieOptions: any = {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    };

    // If the incoming origin is https or we're in production, set SameSite=None and secure
    if (isHttpsOrigin || process.env.NODE_ENV === 'production') {
      cookieOptions.sameSite = 'none';
      cookieOptions.secure = true;
    } else {
      cookieOptions.sameSite = 'lax';
      cookieOptions.secure = false;
    }

    // Optional domain override via env
    if (process.env.COOKIE_DOMAIN) cookieOptions.domain = process.env.COOKIE_DOMAIN;

    res.cookie('access_token', token, cookieOptions);
    return res.json({ success: true });
  }

  @Get('me')
  async me(@Req() req: Request) {
    // read token from cookie and verify
    const token = req.cookies?.access_token;
    if (!token) return { authenticated: false };
    const payload = this.authService.verifyToken(token);
    return { authenticated: true, user: payload };
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    return res.json({ success: true });
  }
}
