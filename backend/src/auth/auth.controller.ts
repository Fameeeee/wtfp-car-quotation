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
  // Service will create token; return it in JSON and do not set cookies.
  // This makes the client responsible for storing the token (localStorage).
  const result = await this.authService.login(email, password);
  const token = result.access_token;

  return res.json({ success: true, access_token: token });
  }

  @Get('me')
  async me(@Req() req: Request) {
    // Try to read token from Authorization header (Bearer <token>)
    const authHeader = req.get('authorization') || req.headers['authorization'] || '';
    let token: string | null = null;
    if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.slice(7).trim();
    }

    if (!token) return { authenticated: false };
    const payload = this.authService.verifyToken(token);
    return { authenticated: true, user: payload };
  }

  @Post('logout')
  async logout(@Res() res: Response) {
  // Token-based stateless logout: client should remove token from storage.
  // If you implement server-side token revocation, add it here.
  return res.json({ success: true });
  }
}
