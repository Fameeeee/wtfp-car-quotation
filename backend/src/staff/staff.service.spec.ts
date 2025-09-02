import { Test, TestingModule } from '@nestjs/testing';
import { StaffService } from './staff.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Quotation } from 'src/quotation/entities/quotation.entity';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from 'src/audit/audit.service';

describe('StaffService', () => {
  let service: StaffService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        { provide: getRepositoryToken(Staff), useValue: {} },
        { provide: getRepositoryToken(Quotation), useValue: {} },
        { provide: JwtService, useValue: { sign: () => 'token' } },
        { provide: AuditService, useValue: { record: async () => null } },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
