import { Test, TestingModule } from '@nestjs/testing';
import { QuotationService } from './quotation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Quotation } from './entities/quotation.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { CustomerService } from 'src/customer/customer.service';
import { StaffService } from 'src/staff/staff.service';
import { AuditService } from 'src/audit/audit.service';

describe('QuotationService', () => {
  let service: QuotationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotationService,
        { provide: getRepositoryToken(Quotation), useValue: {} },
        { provide: getRepositoryToken(Customer), useValue: {} },
        { provide: getRepositoryToken(Staff), useValue: {} },
        { provide: CustomerService, useValue: {} },
        { provide: StaffService, useValue: {} },
        { provide: AuditService, useValue: { record: async () => null } },
      ],
    }).compile();

    service = module.get<QuotationService>(QuotationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
