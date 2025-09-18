import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod, Quotation } from './entities/quotation.entity';
import { Brackets, Repository } from 'typeorm';
import { CustomerService } from 'src/customer/customer.service';
import { StaffService } from 'src/staff/staff.service';
import { AuditService } from 'src/audit/audit.service';

@Injectable()
export class QuotationService {
  private readonly logger = new Logger(QuotationService.name);
  constructor(
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
    private readonly customerService: CustomerService,
    private readonly staffService: StaffService,
  private readonly auditService: AuditService,
  ) {}

  async createQuotation(dto: CreateQuotationDto): Promise<any> {
    let customer = await this.customerService.findByName(
      dto.customer.firstName,
      dto.customer.lastName,
    );

    if (!customer) {
      customer = await this.customerService.createCustomer({
        firstName: dto.customer.firstName,
        lastName: dto.customer.lastName,
        phoneNumber: dto.customer.phoneNumber,
      });
    }

    const staff = await this.staffService.findById(dto.staffId);
    if (!staff) {
      try {
        await this.auditService.record(
          'create_failed',
          'quotation',
          0,
          dto.staffId || null,
          { reason: 'Staff not found', dto },
          'ERROR',
          'quotation',
        );
      } catch (e) {}
      throw new BadRequestException('Staff not found');
    }

    let cashPlans = null;
    let installmentPlans = null;

    if (dto.paymentMethod === PaymentMethod.INSTALLMENT) {
      if (!dto.installmentPlans || dto.installmentPlans.length === 0) {
        throw new BadRequestException(
          'Installment plans are required for installment payments.',
        );
      }
      if (dto.installmentPlans.length > 3) {
        throw new BadRequestException(
          'A maximum of 3 installment plans is allowed.',
        );
      }
      installmentPlans = dto.installmentPlans.map((plan) => ({
        orderNumber: plan.orderNumber,
        specialDiscount: plan.specialDiscount,
        additionPrice: plan.additionPrice,
        downPaymentPercent: plan.downPaymentPercent,
        planDetails: plan.planDetails.map((detail) => ({
          period: detail.period,
          interestRate: detail.interestRate,
        })),
      }));
    } else {
      cashPlans = dto.cashPlans || null;
    }

    const quotation = this.quotationRepository.create({
      quotationDate: new Date(),
      paymentMethod: dto.paymentMethod,
      cashPlans: dto.cashPlans || null,
      installmentPlans,
      additionCosts: dto.additionCosts,
      carDetails: dto.carDetails,
      accessories: dto.accessories || null,
      customer,
      staff,
    });

    await this.quotationRepository.save(quotation);

    try {
      await this.auditService.record(
        'create',
        'quotation',
        quotation.id,
        dto.staffId,
        { createdFrom: null, dto },
  'INFO',
        'quotation',
      );
    } catch (e) {
      this.logger.warn('Failed to record audit for createQuotation', e?.message || e);
    }

    return { quotationId: quotation.id };
  }

  async getAllQuotation(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    data: {
      quotationId: number;
      quotationDate: Date;
      customer: {
        customerId: number;
        firstName: string;
        lastName: string;
      };
      staff: {
        staffId: number;
        firstName: string;
        lastName: string;
      };
      carDetails: {
        unitType: string;
        modelClass: string;
        modelCodeName: string;
        modelGName: string;
        price: number;
        color: string;
      };
    }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.quotationRepository
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.customer', 'customer')
      .leftJoinAndSelect('quotation.staff', 'staff');

    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        `(
        LOWER(CAST(quotation.id AS CHAR)) LIKE :search OR
        LOWER(staff.firstName) LIKE :search OR
        LOWER(staff.lastName) LIKE :search OR
        LOWER(customer.firstName) LIKE :search OR
        LOWER(customer.lastName) LIKE :search OR
        LOWER(CONCAT(customer.firstName, ' ', customer.lastName)) LIKE :search
      )`,
        { search: `%${search.toLowerCase()}%` },
      );
    }

    const total = await queryBuilder.getCount();

    const quotations = await queryBuilder
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('quotation.quotationDate', 'DESC')
      .addOrderBy('quotation.id', 'DESC')
      .getMany();

    const data = quotations.map((q) => ({
      quotationId: q.id,
      quotationDate: q.quotationDate,
      customer: {
        customerId: q.customer?.id || null,
        firstName: q.customer?.firstName || '',
        lastName: q.customer?.lastName || '',
      },
      staff: {
        staffId: q.staff?.id || null,
        firstName: q.staff?.firstName || '',
        lastName: q.staff?.lastName || '',
      },
      carDetails: q.carDetails,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByStaffId(
    staffId: number,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: any[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const query = this.quotationRepository
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.customer', 'customer')
      .leftJoinAndSelect('quotation.staff', 'staff')
      .where('staff.id = :staffId', { staffId });

    if (search && search.trim() !== '') {
      const searchLower = `%${search.toLowerCase()}%`;
      query.andWhere(
        `(
      LOWER(customer.firstName) LIKE :search
      OR LOWER(customer.lastName) LIKE :search
      OR LOWER(CONCAT(customer.firstName, ' ', customer.lastName)) LIKE :search
      OR LOWER(JSON_UNQUOTE(JSON_EXTRACT(quotation.carDetails, '$.modelClass'))) LIKE :search
      OR DATE(quotation.quotationDate) LIKE :search
    )`,
        { search: searchLower },
      );
    }

    const [result, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('quotation.quotationDate', 'DESC')
      .addOrderBy('quotation.id', 'DESC')
      .getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data: result.map((q) => ({
        quotationId: q.id,
        quotationDate: q.quotationDate,
        carDetails: q.carDetails,
        customer: {
          customerId: q.customer.id,
          firstName: q.customer.firstName,
          lastName: q.customer.lastName,
        },
        staff: {
          staffId: q.staff.id,
          firstName: q.staff.firstName,
          lastName: q.staff.lastName,
        },
      })),
      total,
      totalPages,
    };
  }

  async findById(id: number): Promise<any> {
    const quotation = await this.quotationRepository.findOne({
      where: { id },
      relations: ['customer', 'staff'],
    });

  if (!quotation) throw new NotFoundException('Quotation not found');

    return {
      ...quotation,
      staff: {
        id: quotation.staff?.id,
        firstName: quotation.staff?.firstName,
        lastName: quotation.staff?.lastName,
        phoneNumber: quotation.staff?.phoneNumber,
      },
    };
  }

  async updateQuotation(
    id: number,
    updateData: Partial<Quotation>,
  ): Promise<Quotation> {
    this.logger.log(`updateQuotation id=${id}`);

    const quotation = await this.quotationRepository.findOne({ where: { id }, relations: ['staff', 'customer'] });
    if (!quotation) throw new NotFoundException('Quotation not found');

    if (updateData.customer) {
      await this.customerService.updateCustomer(quotation.customer.id, updateData.customer as any);
    }

    Object.assign(quotation, { ...updateData, customer: quotation.customer });

    const saved = await this.quotationRepository.save(quotation);
    this.logger.log(`quotation saved id=${saved.id}`);

    try {
      await this.auditService.record('update', 'quotation', saved.id, saved.staff?.id || null, { changes: updateData });
    } catch (e) {
      this.logger.warn('Failed to record audit for updateQuotation', e?.message || e);
    }

    return saved;
  }

  async deleteQuotation(id: number): Promise<string> {
    const quotation = await this.quotationRepository.findOne({ where: { id } });
    if (!quotation) throw new NotFoundException('Quotation not found');

    await this.quotationRepository.remove(quotation);
    try {
      await this.auditService.record('delete', 'quotation', id, null, null);
    } catch (e) {
      this.logger.warn('Failed to record audit for deleteQuotation', e?.message || e);
    }
    return 'Quotation deleted successfully';
  }

  async createFromExisting(existingId: number, dto: CreateQuotationDto): Promise<any> {
    const existing = await this.quotationRepository.findOne({ where: { id: existingId } });
    if (!existing) throw new BadRequestException('Source quotation not found');

    const result = await this.createQuotation(dto);
    const newId = result.quotationId;
    await this.quotationRepository.update({ id: newId }, { modifiedFromId: existingId } as any);
    try {
      await this.auditService.record('create_from', 'quotation', newId, dto.staffId, { sourceQuotationId: existingId });
    } catch (e) {
      this.logger.warn('Failed to record audit for createFromExisting', e?.message || e);
    }
    return { quotationId: newId };
  }

  async getSummary(): Promise<any> {
    const totalQuotations = await this.quotationRepository.count();

    const recent = await this.quotationRepository
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.customer', 'customer')
      .leftJoinAndSelect('quotation.staff', 'staff')
      .orderBy('quotation.quotationDate', 'DESC')
      .take(5)
      .getMany();

    const raw = await this.quotationRepository
      .createQueryBuilder('quotation')
      .leftJoin('quotation.customer', 'customer')
      .select('COUNT(DISTINCT customer.id)', 'count')
      .getRawOne();

    const totalCustomers = Number(raw?.count || 0);

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthly = await this.quotationRepository
      .createQueryBuilder('quotation')
      .where('quotation.quotationDate >= :start', { start: firstOfMonth.toISOString() })
      .getCount();

    return {
      totalQuotations,
      totalCustomers,
      monthlyQuotations: monthly,
      recent: recent.map((q) => ({
        quotationId: q.id,
        quotationDate: q.quotationDate,
        customer: q.customer ? { id: q.customer.id, firstName: q.customer.firstName, lastName: q.customer.lastName } : null,
        staff: q.staff ? { id: q.staff.id, firstName: q.staff.firstName, lastName: q.staff.lastName } : null,
        carDetails: q.carDetails,
      })),
    };
  }

  // Return last `months` months counts for quotations (default 6 months)
  async getMonthlyStats(months = 6): Promise<{ month: string; monthLabel: string; count: number }[]> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    // Use explicit YEAR/MONTH aggregation to avoid any DB-specific DATE_FORMAT or timezone issues
    const qb = this.quotationRepository
      .createQueryBuilder('quotation')
      .select('YEAR(quotation.quotationDate)', 'y')
      .addSelect('MONTH(quotation.quotationDate)', 'm')
      .addSelect('COUNT(*)', 'count')
      .where('quotation.quotationDate >= :start', { start: start.toISOString() })
      .groupBy('y')
      .addGroupBy('m')
      .orderBy('y', 'ASC')
      .addOrderBy('m', 'ASC');

    const raw: { y: string; m: string; count: string }[] = await qb.getRawMany();

    // Build full months list with zero-fills
    const results: { month: string; monthLabel: string; count: number }[] = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const year = d.getFullYear();
      const monthNum = d.getMonth() + 1; // 1-12
      const ym = `${year}-${String(monthNum).padStart(2, '0')}`; // YYYY-MM
      const label = d.toLocaleString('default', { month: 'short' });
      const found = raw.find((r) => Number(r.y) === year && Number(r.m) === monthNum);
      results.push({ month: ym, monthLabel: label, count: found ? Number(found.count) : 0 });
    }

    return results;
  }

  // Return the immediate source (modifiedFromId) and full ancestor chain for a quotation
  async getCreatedFromChain(id: number): Promise<{ createdFrom: number | null; chain: number[] }> {
    const chain: number[] = [];
    const visited = new Set<number>();
    let currentId = id;
    const maxDepth = 50;

    for (let i = 0; i < maxDepth; i++) {
      const q = await this.quotationRepository.findOne({ where: { id: currentId } });
      if (!q) break;
      let parent = q.modifiedFromId;
      // If DB doesn't have modifiedFromId, try to find from audit logs
      if (!parent) {
        try {
          const auditParent = await this.auditService.findLatestCreateFrom('quotation', currentId);
          if (auditParent) parent = auditParent;
        } catch (e) {
          // ignore
        }
      }
      if (!parent) break;
      if (visited.has(parent)) break; // avoid loops
      chain.push(parent);
      visited.add(parent);
      currentId = parent;
    }

    return { createdFrom: chain.length ? chain[0] : null, chain };
  }

  // Top models by number of quotations
  async getTopModels(limit = 5): Promise<{ model: string; count: number }[]> {
    const qb = this.quotationRepository
      .createQueryBuilder('quotation')
      .select("COALESCE(JSON_UNQUOTE(JSON_EXTRACT(quotation.carDetails, '$.modelGName')), JSON_UNQUOTE(JSON_EXTRACT(quotation.carDetails, '$.modelCodeName')), '')", 'model')
      .addSelect('COUNT(*)', 'count')
      .groupBy('model')
      .orderBy('count', 'DESC')
      .limit(limit);

    const raw: { model: string; count: string }[] = await qb.getRawMany();
    return raw.map((r) => ({ model: r.model || '—', count: Number(r.count) }));
  }

  // Top staff by number of quotations
  async getTopStaff(limit = 5): Promise<{ staffId: number; name: string; count: number }[]> {
    const qb = this.quotationRepository
      .createQueryBuilder('quotation')
      .leftJoin('quotation.staff', 'staff')
      .select('staff.id', 'staffId')
      .addSelect("CONCAT(staff.firstName, ' ', staff.lastName)", 'name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('staff.id')
      .orderBy('count', 'DESC')
      .limit(limit);

    const raw: { staffId: number; name: string; count: string }[] = await qb.getRawMany();
    return raw.map((r) => ({ staffId: Number(r.staffId), name: r.name || '—', count: Number(r.count) }));
  }

  // Payment method distribution
  async getPaymentDistribution(): Promise<{ method: string; count: number }[]> {
    const qb = this.quotationRepository
      .createQueryBuilder('quotation')
      .select('quotation.paymentMethod', 'method')
      .addSelect('COUNT(*)', 'count')
      .groupBy('quotation.paymentMethod');

    const raw: { method: string; count: string }[] = await qb.getRawMany();
    return raw.map((r) => ({ method: r.method || 'unknown', count: Number(r.count) }));
  }

  async exportCsv(search?: string, days?: number): Promise<string> {
    const qb = this.quotationRepository
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.customer', 'customer')
      .leftJoinAndSelect('quotation.staff', 'staff');

    if (search && search.trim() !== '') {
      qb.andWhere(
        `(
          LOWER(CAST(quotation.id AS CHAR)) LIKE :search OR
          LOWER(staff.firstName) LIKE :search OR
          LOWER(staff.lastName) LIKE :search OR
          LOWER(customer.firstName) LIKE :search OR
          LOWER(customer.lastName) LIKE :search
        )`,
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (days && days > 0) {
      const since = new Date();
      since.setDate(since.getDate() - days);
      qb.andWhere('quotation.quotationDate >= :since', { since: since.toISOString() });
    }

    const rows = await qb.orderBy('quotation.quotationDate', 'DESC').getMany();

    const header = ['Quotation ID', 'Date', 'Customer', 'Staff', 'Model', 'Price', 'PaymentMethod'];
    const lines = [header.join(',')];

    for (const q of rows) {
      const customerName = q.customer ? `${q.customer.firstName} ${q.customer.lastName}` : '';
      const staffName = q.staff ? `${q.staff.firstName} ${q.staff.lastName}` : '';
      const model = q.carDetails?.modelGName || q.carDetails?.modelCodeName || '';
      const price = q.carDetails?.price || '';
      const payment = q.paymentMethod || '';
      const date = q.quotationDate ? q.quotationDate.toISOString() : '';

      const row = [q.id, date, `"${customerName.replace(/"/g, '""')}"`, `"${staffName.replace(/"/g, '""')}"`, `"${String(model).replace(/"/g, '""')}"`, price, payment];
      lines.push(row.join(','));
    }

    return lines.join('\n');
  }
}
