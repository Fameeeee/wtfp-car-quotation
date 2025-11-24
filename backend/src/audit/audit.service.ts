import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog, AuditCategory, LogLevel } from './audit.entity';

// Define common action types for consistency
export enum AuditAction {
  // Authentication
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGED = 'password_changed',
  
  // Authorization
  ROLE_CHANGED = 'role_changed',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_REVOKED = 'permission_revoked',
  
  // CRUD Operations
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  VIEWED = 'viewed',
  RESTORED = 'restored',
  
  // Business Operations
  QUOTATION_CREATED = 'quotation_created',
  QUOTATION_SENT = 'quotation_sent',
  QUOTATION_APPROVED = 'quotation_approved',
  QUOTATION_REJECTED = 'quotation_rejected',
  PDF_GENERATED = 'pdf_generated',
  
  // System
  CONFIG_CHANGED = 'config_changed',
  BACKUP_CREATED = 'backup_created',
  
  // Special
  CREATED_FROM = 'created_from',
  BULK_OPERATION = 'bulk_operation',
}

interface RecordLogOptions {
  action: string;
  entity: string;
  entityId: number;
  performedBy?: number | null;
  metadata?: any;
  level?: LogLevel;
  category?: AuditCategory;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private repo: Repository<AuditLog>,
  ) {}

  /**
   * Record an audit log entry
   * @deprecated Use recordLog() with options object instead
   */
  async record(
    action: string,
    entity: string,
    entityId: number,
    performedBy?: number | null,
    metadata?: any,
    level: LogLevel = LogLevel.INFO,
    category: AuditCategory = AuditCategory.GENERAL,
  ) {
    return this.recordLog({
      action,
      entity,
      entityId,
      performedBy,
      metadata,
      level,
      category,
    });
  }

  /**
   * Enhanced method to record audit logs with more context
   */
  async recordLog(options: RecordLogOptions) {
    const {
      action,
      entity,
      entityId,
      performedBy = null,
      metadata = null,
      level = LogLevel.INFO,
      category = AuditCategory.GENERAL,
      ipAddress = null,
      userAgent = null,
      description = null,
    } = options;

    const log = this.repo.create({
      action,
      entity,
      entityId,
      performedBy,
      metadata,
      level,
      category,
      ipAddress,
      userAgent,
      description,
    });

    return await this.repo.save(log);
  }

  /**
   * Helper methods for common audit scenarios
   */
  async logAuthentication(
    action: 'login' | 'logout' | 'login_failed',
    userId: number | null,
    ipAddress?: string,
    metadata?: any,
  ) {
    return this.recordLog({
      action,
      entity: 'staff',
      entityId: userId || 0,
      performedBy: userId,
      category: AuditCategory.AUTHENTICATION,
      level: action === 'login_failed' ? LogLevel.WARN : LogLevel.INFO,
      ipAddress,
      metadata,
      description: `User ${action === 'login_failed' ? 'failed to login' : action}`,
    });
  }

  async logDataModification(
    action: 'created' | 'updated' | 'deleted',
    entity: string,
    entityId: number,
    performedBy: number,
    changes?: any,
  ) {
    return this.recordLog({
      action,
      entity,
      entityId,
      performedBy,
      category: AuditCategory.DATA_MODIFICATION,
      level: action === 'deleted' ? LogLevel.WARN : LogLevel.INFO,
      metadata: { changes },
      description: `${entity} #${entityId} was ${action}`,
    });
  }

  async logBusinessEvent(
    action: string,
    entity: string,
    entityId: number,
    performedBy: number,
    description: string,
    metadata?: any,
  ) {
    return this.recordLog({
      action,
      entity,
      entityId,
      performedBy,
      category: AuditCategory.BUSINESS,
      level: LogLevel.INFO,
      metadata,
      description,
    });
  }

  async logSecurityEvent(
    action: string,
    entity: string,
    entityId: number,
    performedBy: number | null,
    ipAddress: string,
    description: string,
    metadata?: any,
  ) {
    return this.recordLog({
      action,
      entity,
      entityId,
      performedBy,
      category: AuditCategory.SECURITY,
      level: LogLevel.WARN,
      ipAddress,
      metadata,
      description,
    });
  }

  async list(
    entity?: string,
    page = 1,
    limit = 50,
    performedBy?: number | null,
    startDate?: string,
    endDate?: string,
    level?: string,
    category?: string,
    action?: string,
  ) {
    const qb = this.repo.createQueryBuilder('a');
    
    if (entity) qb.andWhere('a.entity = :entity', { entity });
    if (performedBy) qb.andWhere('a.performedBy = :performedBy', { performedBy });
    if (level) qb.andWhere('a.level = :level', { level });
    if (category) qb.andWhere('a.category = :category', { category });
    if (action) qb.andWhere('a.action = :action', { action });
    
    if (startDate && endDate) {
      qb.andWhere('a.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    } else if (startDate) {
      qb.andWhere('a.createdAt >= :start', { start: startDate });
    } else if (endDate) {
      qb.andWhere('a.createdAt <= :end', { end: endDate });
    }

    qb.orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get statistics for dashboard
   */
  async getStatistics(startDate?: string, endDate?: string) {
    const qb = this.repo.createQueryBuilder('a');

    if (startDate && endDate) {
      qb.where('a.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    }

    // Count by level
    const levelStats = await qb
      .select('a.level', 'level')
      .addSelect('COUNT(*)', 'count')
      .groupBy('a.level')
      .getRawMany();

    // Count by category
    const categoryStats = await qb
      .select('a.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('a.category')
      .getRawMany();

    // Count by entity
    const entityStats = await qb
      .select('a.entity', 'entity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('a.entity')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Recent errors
    const recentErrors = await this.repo.find({
      where: { level: LogLevel.ERROR },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      byLevel: levelStats,
      byCategory: categoryStats,
      byEntity: entityStats,
      recentErrors,
      totalLogs: await this.repo.count(),
    };
  }

  async exportCsv(
    entity?: string,
    action?: string,
    performedBy?: number | null,
    startDate?: string,
    endDate?: string,
    level?: string,
    category?: string,
    page?: number,
    limit?: number,
  ) {
    const qb = this.repo.createQueryBuilder('a');
    
    if (entity) qb.where('a.entity = :entity', { entity });
    if (action) qb.andWhere('a.action = :action', { action });
    if (performedBy) qb.andWhere('a.performedBy = :performedBy', { performedBy });
    if (level) qb.andWhere('a.level = :level', { level });
    if (category) qb.andWhere('a.category = :category', { category });
    
    if (startDate) qb.andWhere('a.createdAt >= :start', { start: startDate });
    if (endDate) qb.andWhere('a.createdAt <= :end', { end: endDate });
    
    qb.orderBy('a.createdAt', 'DESC');
    
    if (page && limit) qb.skip((page - 1) * limit).take(limit);
    
    const items = await qb.getMany();

    const cols = [
      'id',
      'level',
      'category',
      'action',
      'entity',
      'entityId',
      'performedBy',
      'ipAddress',
      'description',
      'createdAt',
      'metadata',
    ];
    
    const rows = items.map((r) => {
      return cols
        .map((c) => {
          let v = (r as any)[c];
          if (v === null || v === undefined) return '';
          if (c === 'metadata') {
            try {
              return JSON.stringify(v).replace(/\n/g, ' ');
            } catch (e) {
              return String(v);
            }
          }
          if (c === 'createdAt') return new Date(v).toISOString();
          return String(v);
        })
        .map((cell) => {
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return '"' + cell.replace(/"/g, '""') + '"';
          }
          return cell;
        })
        .join(',');
    }).join('\n');

    const header = cols.join(',');
    return header + '\n' + rows;
  }

  async findLatestCreateFrom(
    entity: string,
    entityId: number,
  ): Promise<number | null> {
    const item = await this.repo
      .createQueryBuilder('a')
      .where('a.entity = :entity', { entity })
      .andWhere('a.entityId = :entityId', { entityId })
      .andWhere("a.action = 'created_from'")
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
