import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Customer } from './entities/customer.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('customer')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerController {
  private readonly logger = new Logger(CustomerController.name);
  constructor(private readonly customerService: CustomerService) { }

  @Post('create')
  @Roles('staff', 'manager')
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    this.logger.log('POST /customer/create');
    return await this.customerService.createCustomer(createCustomerDto);
  }

  @Get()
  @Roles('staff', 'manager')
  async getAllCustomers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('search') search?: string
  ) {
    return await this.customerService.getAllCustomers(page, limit, search);
  }

  @Get(':id')
  @Roles('staff', 'manager')
  async findById(@Param('id') id: number) {
    return await this.customerService.findById(+id);
  }

  @Get('phone/:phone')
  @Roles('staff', 'manager')
  async findByPhone(@Param('phone') phone: string) {
    return await this.customerService.findByPhone(phone);
  }

  @Put(':id')
  @Roles('staff', 'manager')
  async updateCustomer(@Param('id') id: number, @Body() updateData: Partial<Customer>) {
    this.logger.log(`PUT /customer/${id}`);
    return await this.customerService.updateCustomer(id, updateData);
  }

  @Delete(':id')
  @Roles('manager')
  async deleteCustomer(@Param('id') id: number) {
    this.logger.log(`DELETE /customer/${id}`);
    await this.customerService.deleteCustomer(id);
    return { deleted: true };
  }
}
