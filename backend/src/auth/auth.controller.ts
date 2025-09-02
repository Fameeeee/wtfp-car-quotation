import { Controller, Get, Post, Body, Logger, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() staffData: any) {
    this.logger.log('POST /auth/register');
    return this.authService.register(staffData);
  }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    this.logger.log('POST /auth/login');
    // Service will create token; return it in JSON so the client can store it.
    const result = await this.authService.login(email, password);
    return { success: true, access_token: result.access_token };
  }

  @Get('me')
  async me(@Req() req: Request) {
    // Accept token via Authorization: Bearer <token>
    const authHeader = (req.headers.authorization as string) || null;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return { authenticated: false };
    const payload = this.authService.verifyToken(token);
    if (!payload) return { authenticated: false };
    return { authenticated: true, user: payload };
  }

  @Post('logout')
  async logout() {
    // Token-based stateless logout: client should remove token from storage.
    return { success: true };
  }
}
