import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod, Quotation } from './entities/quotation.entity';
import { Brackets, Repository } from 'typeorm';
import { CustomerService } from 'src/customer/customer.service';
import { StaffService } from 'src/staff/staff.service';

@Injectable()
export class QuotationService {
  constructor(
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
    private readonly customerService: CustomerService,
    private readonly staffService: StaffService,
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

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

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
  console.log(`[SERVICE] updateQuotation called id=${id}`);
  console.log('updateData:', JSON.stringify(updateData));

  const quotation = await this.quotationRepository.findOne({
      where: { id },
      relations: ['staff', 'customer'],
    });

    if (!quotation) {
      throw new Error('Quotation not found');
    }

    if (updateData.customer) {
      await this.customerService.updateCustomer(quotation.customer.id, updateData.customer);
    }

    Object.assign(quotation, { ...updateData, customer: quotation.customer });

    const saved = await this.quotationRepository.save(quotation);
    console.log(`[SERVICE] quotation saved id=${saved.id}`);
    return saved;
  }

  async deleteQuotation(id: number): Promise<string> {
    const quotation = await this.quotationRepository.findOne({ where: { id } });

    if (!quotation) {
      throw new Error('Quotation not found');
    }

    await this.quotationRepository.remove(quotation);
    return 'Quotation deleted successfully';
  }
}
