import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private repo: Repository<AuditLog>,
  ) {}

  async record(action: string, entity: string, entityId: number, performedBy?: number | null, metadata?: any) {
    const log = this.repo.create({ action, entity, entityId, performedBy: performedBy ?? null, metadata: metadata ?? null });
    return this.repo.save(log);
  }

  async list(entity?: string, page = 1, limit = 50, performedBy?: number | null, startDate?: string, endDate?: string) {
    const qb = this.repo.createQueryBuilder('a');
    if (entity) qb.where('a.entity = :entity', { entity });
    if (performedBy) qb.andWhere('a.performedBy = :performedBy', { performedBy });
    if (startDate) qb.andWhere('a.createdAt >= :start', { start: startDate });
    if (endDate) qb.andWhere('a.createdAt <= :end', { end: endDate });
    qb.orderBy('a.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { data: items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async exportCsv(entity?: string, action?: string, performedBy?: number | null, startDate?: string, endDate?: string, page?: number, limit?: number) {
    const qb = this.repo.createQueryBuilder('a');
    if (entity) qb.where('a.entity = :entity', { entity });
    if (action) qb.andWhere('a.action = :action', { action });
    if (performedBy) qb.andWhere('a.performedBy = :performedBy', { performedBy });
    if (startDate) qb.andWhere('a.createdAt >= :start', { start: startDate });
    if (endDate) qb.andWhere('a.createdAt <= :end', { end: endDate });
    qb.orderBy('a.createdAt', 'DESC');
    if (page && limit) qb.skip((page - 1) * limit).take(limit);
    const items = await qb.getMany();

    // Build CSV
    const cols = ['id', 'action', 'entity', 'entityId', 'performedBy', 'createdAt', 'metadata'];
    const rows = items.map((r) => {
      return cols.map((c) => {
        let v = (r as any)[c];
        if (v === null || v === undefined) return '';
        if (c === 'metadata') {
          try { return JSON.stringify(v).replace(/\n/g, ' '); } catch (e) { return String(v); }
        }
        if (c === 'createdAt') return new Date(v).toISOString();
        return String(v);
      }).map((cell) => {
        // escape double quotes
        if (cell.includes(',') || cell.includes('\"') || cell.includes('\n')) {
          return '"' + cell.replace(/"/g, '""') + '"';
        }
        return cell;
      }).join(',');
    }).join('\n');

    const header = cols.join(',');
    return header + '\n' + rows;
  }

  // Find the latest 'create_from' audit for an entity and return the source id if exist
  async findLatestCreateFrom(entity: string, entityId: number): Promise<number | null> {
    const item = await this.repo.createQueryBuilder('a')
      .where('a.entity = :entity', { entity })
      .andWhere('a.entityId = :entityId', { entityId })
      .andWhere("a.action = 'create_from'")
      .orderBy('a.createdAt', 'DESC')
      .getOne();
    if (!item || !item.metadata) return null;
    try {
      const m = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata;
      if (m.sourceQuotationId) return Number(m.sourceQuotationId);
      if (m.source_quotation_id) return Number(m.source_quotation_id);
      if (m.createdFrom) return Number(m.createdFrom);
      if (m.createdFromId) return Number(m.createdFromId);
      if (m.from && (m.from.id || m.fromId)) return Number(m.from.id || m.fromId);
    } catch (e) {}
    return null;
  }
}
