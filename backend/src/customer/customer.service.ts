import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) { }

  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const { firstName, lastName, phoneNumber } = createCustomerDto;

    let customer = await this.customerRepository.findOne({
      where: { firstName, lastName, phoneNumber },
      relations: ['quotations']
    });

    if (!customer) {
      customer = this.customerRepository.create(createCustomerDto);
      await this.customerRepository.save(customer);
    }

    return customer;
  }

  async getAllCustomers(page: number, limit: number, search?: string): Promise<{
    data: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {

    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer');

    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        `(
            LOWER(customer.firstName) LIKE :search OR 
            LOWER(customer.lastName) LIKE :search OR 
            LOWER(customer.phoneNumber) LIKE :search OR 
            LOWER(CAST(customer.id AS CHAR)) LIKE :search
          )`,
        { search: `%${search.toLowerCase()}%` }
      );
    }

    const total = await queryBuilder.getCount();

    const data = await queryBuilder
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('customer.id', 'DESC')
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findByName(firstName: string, lastName: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({
      where: { firstName, lastName },
    });
  }

  async findById(id: number): Promise<Customer | null> {
    const customer = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.quotations', 'quotation') 
      .where('customer.id = :id', { id })
      .getOne();

    if (!customer) {
      return null;
    }

    customer.quotations = customer.quotations.map((quotation) => ({
      id: quotation.id,
      quotationDate: quotation.quotationDate,
      paymentMethod: quotation.paymentMethod,
      carDetails: quotation.carDetails,
      staff: quotation.staff,
      customer: quotation.customer,
    }));

    return customer;
  }

  async updateCustomer(id: number, updateData: Partial<Customer>): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } })

    if (!customer) {
      throw new Error('Customer not found')
    }

    Object.assign(customer, updateData);
    return this.customerRepository.save(customer)

  }

  async deleteCustomer(id: number): Promise<string> {
    const customer = await this.customerRepository.findOne({ where: { id } })

    if (!customer) {
      throw new Error('Customer not found')
    }

    await this.customerRepository.remove(customer);
    return 'Customer deleted successfully'
  }
}
