import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Customer } from './entities/customer.entity';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Post('create')
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return this.customerService.createCustomer(createCustomerDto);
  }

  @Get()
  async getAllCustomers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('search') search?: string
  ) {
    return await this.customerService.getAllCustomers(page, limit, search);
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    return await this.customerService.findById(+id);
  }

  @Put(':id')
  async updateCustomer(@Param('id') id: number, @Body() updateData: Partial<Customer>) {
    return await this.customerService.updateCustomer(id, updateData);
  }

  @Delete(':id')
  async deleteCustomer(@Param('id') id: number) {
    return await this.customerService.deleteCustomer(id);
  }
}
