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
  Res,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { Quotation } from './entities/quotation.entity';
import { PdfService } from './pdf.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('quotation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuotationController {
  private readonly logger = new Logger(QuotationController.name);
  constructor(
    private readonly quotationService: QuotationService,
    private readonly pdfService: PdfService,
  ) {}

  @Post('create')
  @Roles('staff', 'manager')
  async create(@Body() dto: CreateQuotationDto) {
    this.logger.log('POST /quotation/create');
    return await this.quotationService.createQuotation(dto);
  }

  @Post('create-from/:id')
  @Roles('staff', 'manager')
  async createFrom(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateQuotationDto) {
    return await this.quotationService.createFromExisting(id, dto);
  }

  @Get()
  @Roles('staff', 'manager')
  async getAllQuotation(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return await this.quotationService.getAllQuotation(page, limit, search);
  }

  @Get('summary')
  @Roles('staff', 'manager')
  async summary() {
    return await this.quotationService.getSummary();
  }

  @Get('stats/monthly')
  @Roles('staff', 'manager')
  async monthlyStats(@Query('months', new DefaultValuePipe(6), ParseIntPipe) months: number) {
    return await this.quotationService.getMonthlyStats(months);
  }

  @Get('stats/top-models')
  @Roles('staff', 'manager')
  async topModels(@Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number) {
    return await this.quotationService.getTopModels(limit);
  }

  @Get('stats/top-staff')
  @Roles('manager')
  async topStaff(@Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number) {
    return await this.quotationService.getTopStaff(limit);
  }

  @Get('stats/payment-distribution')
  @Roles('staff', 'manager')
  async paymentDistribution() {
    return await this.quotationService.getPaymentDistribution();
  }

  @Get('export')
  @Roles('manager')
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
  @Roles('staff', 'manager')
  async findById(@Param('id') id: number) {
    return await this.quotationService.findById(id);
  }

  @Get(':id/created-from')
  @Roles('staff', 'manager')
  async createdFrom(@Param('id', ParseIntPipe) id: number) {
    return await this.quotationService.getCreatedFromChain(id);
  }

  @Get(':id/pdf')
  @Roles('staff', 'manager')
  async generatePdfById(
    @Param('id', ParseIntPipe) id: number,
    @Query('template') template?: string,
    @Res() res?: Response,
  ) {
    const templateKey = template || undefined; // Let service use default if not specified
    const buffer = await this.pdfService.generateById(id, { preview: false, templateKey });
    if (res) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=quotation-${id}-${templateKey || 'default'}.pdf`);
      return res.send(buffer);
    }
    return buffer;
  }

  @Get('staff/:id')
  @Roles('staff', 'manager')
  async findByStaffId(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return await this.quotationService.findByStaffId(id, page, limit, search);
  }

  @Put(':id')
  @Roles('staff', 'manager')
  async updateQuotation(@Param('id') id: number, @Body() updateData: Partial<Quotation>) {
    this.logger.log(`PUT /quotation/${id}`);
    const updated = await this.quotationService.updateQuotation(id, updateData);
    this.logger.log(`Updated quotation id=${id}`);
    return updated;
  }

  @Delete(':id')
  @Roles('manager')
  async deleteQuotation(@Param('id') id: number) {
    await this.quotationService.deleteQuotation(+id);
    return { deleted: true };
  }

  @Post('pdf')
  @Roles('staff', 'manager')
  async generatePdfFromData(@Body() body: any, @Res() res: Response) {
    const wantsFull = !!(body && body.full);
    const forcePreview = !!(body && body.preview);
    const templateKey = body?.templateKey || body?.template || undefined;
    // Default to preview (single page) unless explicitly requesting full
    const preview = forcePreview || !wantsFull;
    const buffer = await this.pdfService.generateFromData(body, { preview, templateKey });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=quotation-preview-${templateKey || 'default'}.pdf`);
    return res.send(buffer);
  }
}
