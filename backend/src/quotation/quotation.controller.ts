import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { Quotation } from './entities/quotation.entity';

@Controller('quotation')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) { }

  @Post('create')
  async create(@Body() createQuotationDto: CreateQuotationDto): Promise<Quotation> {
    return this.quotationService.createQuotation(createQuotationDto);
  }

  @Get()
  findAll() {
    return this.quotationService.findAll();
  }

  @Get('customer/:id')
  async getCustomerQuotations(@Param('id') id: number) {
    return await this.quotationService.findQuotationByCustomer(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuotationDto: UpdateQuotationDto) {
    return this.quotationService.update(+id, updateQuotationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotationService.remove(+id);
  }
}
