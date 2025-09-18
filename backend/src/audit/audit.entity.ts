import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;


  @Column()
  action: string; 

  @Column({ default: 'INFO' })
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL'; 

  @Column({ default: 'general' })
  category: string; 

  @Column()
  entity: string; 

  @Column()
  entityId: number;

  @Column({ nullable: true, type: 'int' })
  performedBy: number | null; 

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
