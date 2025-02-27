import { Injectable } from '@nestjs/common';
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
    const { firstname, lastname } = createCustomerDto;

    let customer = await this.customerRepository.findOne({
      where: { firstname, lastname },
      relations: ['quotations']
    });

    if (!customer) {
      customer = this.customerRepository.create(createCustomerDto);
      await this.customerRepository.save(customer);
    }

    return customer;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await this.customerRepository.find();
  }

  async findByName(firstname: string, lastname: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({
      where: { firstname, lastname },
    });
  }

  async findById(id: number): Promise<Customer | null> {
    return this.customerRepository.findOne({
      where: { id },
      relations: ['quotations'],
    });
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
