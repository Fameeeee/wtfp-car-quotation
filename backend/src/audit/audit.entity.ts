import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

// Define action categories for better organization
export enum AuditCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_MODIFICATION = 'data_modification',
  SECURITY = 'security',
  SYSTEM = 'system',
  BUSINESS = 'business',
  GENERAL = 'general',
}

// Define log levels
export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

@Entity('audit_log')
@Index(['entity', 'createdAt'])
@Index(['performedBy', 'createdAt'])
@Index(['category', 'createdAt'])
@Index(['level', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string; 

  @Column({ 
    type: 'enum',
    enum: LogLevel,
    default: LogLevel.INFO 
  })
  level: LogLevel; 

  @Column({ 
    type: 'enum',
    enum: AuditCategory,
    default: AuditCategory.GENERAL 
  })
  category: AuditCategory; 

  @Column()
  entity: string; 

  @Column()
  entityId: number;

  @Column({ nullable: true, type: 'int' })
  performedBy: number | null; 

  @Column({ nullable: true, length: 45 })
  ipAddress: string | null;

  @Column({ nullable: true, length: 255 })
  userAgent: string | null;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
