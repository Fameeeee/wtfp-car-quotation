import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, DefaultValuePipe, ParseIntPipe, Res } from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { Quotation } from './entities/quotation.entity';
import { PdfService } from './pdf.service';
import { Response } from 'express';

@Controller('quotation')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService, private readonly pdfService: PdfService) { }

  @Post('create')
  async create(@Body() dto: CreateQuotationDto): Promise<{ message: string, quotationId?: number } | { error: string }> {
    try {
  console.log('[API] POST /quotation/create payload:', JSON.stringify(dto));
      const result = await this.quotationService.createQuotation(dto);

      if (result && result.quotationId) {
        return { message: 'Quotation created successfully', quotationId: result.quotationId };

      }
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
  console.log(`[API] PUT /quotation/${id} payload:`, JSON.stringify(updateData));
  const updated = await this.quotationService.updateQuotation(id, updateData);
  console.log(`[API] Updated quotation id=${id}`);
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
