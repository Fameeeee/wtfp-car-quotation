import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod, Quotation } from './entities/quotation.entity';
import { Repository } from 'typeorm';
import { CustomerService } from 'src/customer/customer.service';
import { StaffService } from 'src/staff/staff.service';

@Injectable()
export class QuotationService {
  constructor(
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
    private readonly customerService: CustomerService,
    private readonly staffService: StaffService,
  ) { }

  async createQuotation(dto: CreateQuotationDto): Promise<any> {
    let customer = await this.customerService.findByName(dto.customer.firstName, dto.customer.lastName);

    if (!customer) {
      customer = await this.customerService.createCustomer({
        firstName: dto.customer.firstName,
        lastName: dto.customer.lastName,
        phoneNumber: dto.customer.phoneNumber,
      });
    }

    const staff = await this.staffService.findById(dto.staffId);
    if (!staff) {
      throw new BadRequestException('Staff not found')
    }

    let cashPlans = null;
    let installmentPlans = null;

    if (dto.paymentMethod === PaymentMethod.INSTALLMENT) {
      if (!dto.installmentPlans || dto.installmentPlans.length === 0) {
        throw new BadRequestException('Installment plans are required for installment payments.');
      }
      if (dto.installmentPlans.length > 3) {
        throw new BadRequestException('A maximum of 3 installment plans is allowed.');
      }
      installmentPlans = dto.installmentPlans;
    } else {
      cashPlans = dto.cashPlans || null;
    }

    const quotation = this.quotationRepository.create({
      quotationDate: new Date(),
      paymentMethod: dto.paymentMethod,
      cashPlans,
      installmentPlans,
      note: dto.note || null,
      carDetails: dto.carDetails,
      accessories: dto.accessories || null,
      customer,
      staff,
    });

    await this.quotationRepository.save(quotation);
  }

  async getAllQuotation() {
    try {
      return await this.quotationRepository
        .createQueryBuilder('quotation')
        .leftJoinAndSelect('quotation.customer', 'customer')
        .leftJoinAndSelect('quotation.staff', 'staff')
        .select([
          'quotation.id',
          'quotation.paymentMethod',
          'quotation.quotationDate',
          'quotation.cashPlans',
          'quotation.installmentPlans',
          'quotation.note',
          'quotation.carDetails',
          'quotation.accessories',
          'customer.id',
          'customer.firstName',
          'customer.lastName',
          'customer.phoneNumber',
          'staff.id',
          'staff.firstName',
          'staff.lastName',
        ])
        .getMany();
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to retrieve quotations');
    }
  }


  async findById(id: number): Promise<Quotation> {
    const quotation = await this.quotationRepository.findOne({
      where: { id },
      relations: ['customer', 'staff'],

    });
    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }
    return quotation;
  }

  async updateQuotation(id: number, updateData: Partial<Quotation>): Promise<Quotation> {
    const quotation = await this.quotationRepository.findOne({ where: { id }, relations: ['staff', 'customer'] })

    if (!quotation) {
      throw new Error('Quotation not found')
    }


    Object.assign(quotation, updateData);
    return await this.quotationRepository.save(quotation);
  }

  async deleteQuotation(id: number): Promise<string> {
    const quotation = await this.quotationRepository.findOne({ where: { id } })

    if (!quotation) {
      throw new Error('Quotation not found')
    }

    await this.quotationRepository.remove(quotation);
    return 'Quotation deleted successfully'
  }
}
