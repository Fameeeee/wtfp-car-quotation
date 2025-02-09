import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { create } from 'domain';

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


  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
