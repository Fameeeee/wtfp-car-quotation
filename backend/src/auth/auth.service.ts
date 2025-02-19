import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { StaffService } from 'src/staff/staff.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Staff } from 'src/staff/entities/staff.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly staffService: StaffService,
    private readonly jwtService: JwtService,
  ) {}

  async register(staffData: Partial<Staff>): Promise<{ message: string }> {
    await this.staffService.createStaff(staffData);
    return { message: 'Registration Successful' }; 
  }
  
  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const staff = await this.staffService.findByEmail(email);
    if (!staff) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { id: staff.id, email: staff.email, role: staff.role };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }
}
