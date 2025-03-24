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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() staffData: any) {
    return this.authService.register(staffData);
  }

  @Post('login')
  async login(@Body('email') email:string, @Body('password') password: string) {
    return this.authService.login(email, password)
  }
}
