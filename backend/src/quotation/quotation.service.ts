import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod, Quotation } from './entities/quotation.entity';
import { Repository } from 'typeorm';
import { CustomerService } from 'src/customer/customer.service';

@Injectable()
export class QuotationService {
  constructor(
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
    private readonly customerService: CustomerService,
  ) { }

  async createQuotation(dto: CreateQuotationDto): Promise<Quotation> {
    let customer = await this.customerService.findByName(dto.customer.firstname, dto.customer.lastname);

    if (!customer) {
      customer = await this.customerService.createCustomer({
        firstname: dto.customer.firstname,
        lastname: dto.customer.lastname,
      });
    }

    let totalPrice: number | null = dto.totalPrice;
    let installmentPlans = null;

    if (dto.paymentMethod === PaymentMethod.INSTALLMENT) {
      if (!dto.installmentPlans || dto.installmentPlans.length === 0) {
        throw new BadRequestException('Installment plans are required for installment payments.');
      }
      if (dto.installmentPlans.length > 3) {
        throw new BadRequestException('A maximum of 3 installment plans is allowed.');
      }
      totalPrice = null;
      installmentPlans = dto.installmentPlans;
    } else {
      installmentPlans = null;
    }

    const quotation = this.quotationRepository.create({
      quotationDate: new Date(),
      paymentMethod: dto.paymentMethod,
      totalPrice,
      installmentPlans,
      specialDiscount: dto.specialDiscount || null,
      note: dto.note || null,
      carDetails: dto.carDetails,
      accessories: dto.accessories || null,
      customer,
    });

    return await this.quotationRepository.save(quotation);
  }

  async findQuotationByCustomer(customerId: number): Promise<Quotation[]> {
    const customer = await this.customerService.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer.quotations;
  }


  findAll() {
    return `This action returns all quotation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} quotation`;
  }

  update(id: number, updateQuotationDto: UpdateQuotationDto) {
    return `This action updates a #${id} quotation`;
  }

  remove(id: number) {
    return `This action removes a #${id} quotation`;
  }
}
