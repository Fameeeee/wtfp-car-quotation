import { Controller, Get, Post, Body, Logger, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { Public } from './public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() staffData: any) {
    this.logger.log('POST /auth/register');
    const result = await this.authService.register(staffData);
    return {
      message: result.message,
    };
  }

  @Public()
  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    this.logger.log('POST /auth/login');
    const result = await this.authService.login(email, password);
    return {
      message: 'Login successful',
      access_token: result.access_token,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    // User is already attached by JwtAuthGuard
    const user = (req as any).user;
    return {
      message: 'User authenticated',
      authenticated: true,
      user: user,
    };
  }

  @Public()
  @Post('logout')
  async logout() {
    // Token-based stateless logout: client should remove token from storage.
    return {
      message: 'Logout successful',
    };
  }
}
