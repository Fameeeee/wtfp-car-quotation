// staff/dto/staff-login.dto.ts

import { IsEmail, IsString } from 'class-validator';

export class StaffLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
