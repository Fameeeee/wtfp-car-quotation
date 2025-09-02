import { Test, TestingModule } from '@nestjs/testing';
import { QuotationController } from './quotation.controller';
import { QuotationService } from './quotation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Quotation } from './entities/quotation.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { AuditService } from 'src/audit/audit.service';
import { CustomerService } from 'src/customer/customer.service';
import { StaffService } from 'src/staff/staff.service';
import { PdfService } from './pdf.service';
import { AuthService } from 'src/auth/auth.service';
import { Reflector } from '@nestjs/core';

describe('QuotationController', () => {
  let controller: QuotationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuotationController],
      providers: [
        QuotationService,
        { provide: PdfService, useValue: { generateById: async () => Buffer.from(''), generateFromData: async () => Buffer.from('') } },
        { provide: getRepositoryToken(Quotation), useValue: {} },
        { provide: getRepositoryToken(Customer), useValue: {} },
  { provide: getRepositoryToken(Staff), useValue: {} },
  { provide: CustomerService, useValue: {} },
  { provide: StaffService, useValue: {} },
  { provide: AuditService, useValue: { record: async () => null } },
  { provide: AuthService, useValue: {} },
  { provide: Reflector, useValue: { get: () => ['admin'] } },
      ],
    }).compile();

    controller = module.get<QuotationController>(QuotationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
