import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { StaffService } from 'src/staff/staff.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Staff } from 'src/staff/entities/staff.entity';
import { AuditService } from 'src/audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly staffService: StaffService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async register(staffData: Partial<Staff>): Promise<{ message: string }> {
    const staff = await this.staffService.createStaff(staffData);
    await this.auditService.record(
      'register',
      'staff',
      staff?.id || 0,
      staff?.id || null,
      { email: staffData.email },
      'INFO',
      'auth',
    );
    return { message: 'Registration Successful' };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const staff = await this.staffService.findByEmail(email);
    if (!staff) {
      // Log failed login
      await this.auditService.record(
        'login_failed',
        'staff',
        0,
        null,
        { email },
        'WARN',
        'auth',
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password);
    if (!isPasswordValid) {
      await this.auditService.record(
        'login_failed',
        'staff',
        staff.id,
        staff.id,
        { email },
        'WARN',
        'auth',
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    if (staff.status && staff.status !== 'active') {
      await this.auditService.record(
        'login_failed',
        'staff',
        staff.id,
        staff.id,
        { email, reason: 'inactive' },
        'WARN',
        'auth',
      );
      throw new UnauthorizedException('Account is not active');
    }

    const payload = {
      id: staff.id,
      email: staff.email,
      role: staff.role,
      status: staff.status,
    };
    const access_token = this.jwtService.sign(payload);

    await this.auditService.record(
      'login',
      'staff',
      staff.id,
      staff.id,
      { email },
      'INFO',
      'auth',
    );

    return { access_token };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      return null;
    }
  }
}
