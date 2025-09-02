import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, DefaultValuePipe, ParseIntPipe, Logger } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Customer } from './entities/customer.entity';

@Controller('customer')
export class CustomerController {
  private readonly logger = new Logger(CustomerController.name);
  constructor(private readonly customerService: CustomerService) { }

  @Post('create')
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
  this.logger.log('POST /customer/create');
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

  @Get('phone/:phone')
  async findByPhone(@Param('phone') phone: string) {
    return await this.customerService.findByPhone(phone);
  }

  @Put(':id')
  async updateCustomer(@Param('id') id: number, @Body() updateData: Partial<Customer>) {
  this.logger.log(`PUT /customer/${id}`);
  return await this.customerService.updateCustomer(id, updateData);
  }

  @Delete(':id')
  async deleteCustomer(@Param('id') id: number) {
  this.logger.log(`DELETE /customer/${id}`);
  return await this.customerService.deleteCustomer(id);
  }
}
