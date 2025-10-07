import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, DefaultValuePipe, ParseIntPipe, Res, UseGuards, Logger } from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { Quotation } from './entities/quotation.entity';
import { PdfService } from './pdf.service';
import { Response } from 'express';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('quotation')
export class QuotationController {
  private readonly logger = new Logger(QuotationController.name);
  constructor(private readonly quotationService: QuotationService, private readonly pdfService: PdfService) { }

  @Post('create')
  async create(@Body() dto: CreateQuotationDto): Promise<{ message: string, quotationId?: number } | { error: string }> {
    this.logger.log('POST /quotation/create');
    const result = await this.quotationService.createQuotation(dto);
    if (result && result.quotationId) {
      return { message: 'Quotation created successfully', quotationId: result.quotationId };
    }
    return { message: 'Created Successfully' };
  }

  @Post('create-from/:id')
  async createFrom(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateQuotationDto) {
    const result = await this.quotationService.createFromExisting(id, dto);
    return { message: 'Created from existing', quotationId: result.quotationId };
  }

  @Get()
  async getAllQuotation(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('search') search?: string
  ) {
    return this.quotationService.getAllQuotation(page, limit, search);
  }

  @Get('summary')
  async summary() {
    return this.quotationService.getSummary();
  }

  @Get('stats/monthly')
  async monthlyStats(@Query('months', new DefaultValuePipe(6), ParseIntPipe) months: number) {
    return this.quotationService.getMonthlyStats(months);
  }

  @Get('stats/top-models')
  async topModels(@Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number) {
    return this.quotationService.getTopModels(limit);
  }

  @Get('stats/top-staff')
  @UseGuards(RolesGuard)
  @Roles('manager')
  async topStaff(@Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number) {
    return this.quotationService.getTopStaff(limit);
  }

  @Get('stats/payment-distribution')
  async paymentDistribution() {
    return this.quotationService.getPaymentDistribution();
  }

  @Get('export')
  async exportCsv(
    @Query('search') search?: string,
    @Query('days', new DefaultValuePipe(0), ParseIntPipe) days?: number,
    @Res() res?: Response,
  ) {
    const csv = await this.quotationService.exportCsv(search, days);
    // If response object available, send as attachment
    if (res) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=quotations.csv`);
      return res.send(csv);
    }
    return csv;
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    return this.quotationService.findById(id);
  }

  @Get(':id/created-from')
  async createdFrom(@Param('id', ParseIntPipe) id: number) {
    return this.quotationService.getCreatedFromChain(id);
  }

  @Get(':id/pdf')
  async generatePdfById(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const buffer = await this.pdfService.generateById(id, { preview: false });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=quotation-${id}.pdf`);
    return res.send(buffer);
  }

  @Get('staff/:id')
  async findByStaffId(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.quotationService.findByStaffId(id, page, limit, search);
  }



  @Put(':id')
  async updateQuotation(@Param('id') id: number, @Body() updateData: Partial<Quotation>) {
  this.logger.log(`PUT /quotation/${id}`);
  const updated = await this.quotationService.updateQuotation(id, updateData);
  this.logger.log(`Updated quotation id=${id}`);
  return updated;
  }

  @Delete(':id')
  async deleteQuotation(@Param('id') id: number) {
    return this.quotationService.deleteQuotation(+id);
  }

  @Post('pdf')
  async generatePdfFromData(@Body() body: any, @Res() res: Response) {
  const wantsFull = !!(body && body.full);
  const forcePreview = !!(body && body.preview);
  // Default to preview (single page) unless explicitly requesting full
  const preview = forcePreview || !wantsFull;
  const buffer = await this.pdfService.generateFromData(body, { preview });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=quotation-preview.pdf');
    return res.send(buffer);
  }
}
