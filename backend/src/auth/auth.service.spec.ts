import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Staff } from 'src/staff/entities/staff.entity';
import { JwtService } from '@nestjs/jwt';
import { StaffService } from 'src/staff/staff.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
  { provide: getRepositoryToken(Staff), useValue: {} },
  { provide: JwtService, useValue: { sign: () => 'token' } },
  { provide: StaffService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
