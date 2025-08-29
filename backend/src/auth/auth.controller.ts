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
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // When frontend is hosted on a different origin (production), we need
      // SameSite=None so the browser will send the cookie on cross-site XHR/fetch.
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });
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
