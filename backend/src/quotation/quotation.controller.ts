import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { Quotation } from './entities/quotation.entity';

@Controller('quotation')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) { }

  @Post('create')
  async create(@Body() dto: CreateQuotationDto): Promise<{ message: string } | { error: string }> {
    try {
      await this.quotationService.createQuotation(dto);
      return { message: 'Created Successfully' };
    } catch (error) {
      return { error: error.message || 'An error occurred' };
    }
  }

  @Get()
  async getAllQuotation(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('search') search?: string
  ) {
    return this.quotationService.getAllQuotation(page, limit, search);
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    return this.quotationService.findById(id);
  }

  @Put(':id')
  async updateQuotation(@Param('id') id: number, @Body() updateData: Partial<Quotation>) {
    return this.quotationService.updateQuotation(id, updateData);
  }

  @Delete(':id')
  async deleteQuotation(@Param('id') id: number) {
    return this.quotationService.deleteQuotation(+id);
  }
}
