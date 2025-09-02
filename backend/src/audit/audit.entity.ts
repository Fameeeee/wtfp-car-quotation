import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string; // e.g., 'create', 'update', 'delete', 'create_from'

  @Column()
  entity: string; // e.g., 'quotation'

  @Column()
  entityId: number;

  @Column({ nullable: true, type: 'int' })
  performedBy: number | null; // staff id

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
