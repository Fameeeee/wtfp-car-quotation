import { Controller, Get, Query, Logger } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  private readonly logger = new Logger(AuditController.name);
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async list(
    @Query('entity') entity?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('performedBy') performedBy?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('level') level?: string,
  ) {
    const p = Number(page) || 1;
    const l = Number(limit) || 50;
    const pb = performedBy ? Number(performedBy) : undefined;
    this.logger.log(`GET /audit entity=${entity} page=${p} limit=${l} level=${level}`);
    return this.auditService.list(entity, p, l, pb, startDate, endDate, level);
  }

  @Get('export')
  async export(
    @Query('entity') entity?: string,
    @Query('action') action?: string,
    @Query('performedBy') performedBy?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('level') level?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    const pb = performedBy ? Number(performedBy) : undefined;
    const p = Number(page) || 1;
    const l = Number(limit) || 50;
    const csv = await this.auditService.exportCsv(entity, action, pb, startDate, endDate, level, p, l);
    return {
      headers: { 'content-type': 'text/csv' },
      data: csv,
    };
  }
}
