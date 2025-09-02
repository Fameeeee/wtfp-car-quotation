import { Test, TestingModule } from '@nestjs/testing';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Quotation } from 'src/quotation/entities/quotation.entity';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from 'src/audit/audit.service';
import { AuthService } from 'src/auth/auth.service';

describe('StaffController', () => {
  let controller: StaffController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffController],
      providers: [
        StaffService,
        { provide: getRepositoryToken(Staff), useValue: {} },
  { provide: getRepositoryToken(Quotation), useValue: {} },
  { provide: JwtService, useValue: { sign: () => 'token' } },
  { provide: AuditService, useValue: { record: async () => null } },
  { provide: AuthService, useValue: {} },
      ],
    }).compile();

    controller = module.get<StaffController>(StaffController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
