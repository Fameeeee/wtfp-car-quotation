import { Quotation } from "src/quotation/entities/quotation.entity";
import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

export enum StaffRole {
    STAFF = 'staff',
    MANAGER = 'manager',
  }
  
export enum StaffStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  UNEMPLOYED = 'unemployed',
}
  

@Entity('staff')
export class Staff {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @Column()
    firstName: string;

    @Column({unique: true})
    lastName: string;

    @Column()
    gender: string;

    @Column({unique: true})
    phoneNumber: string;

    @Column({default: 'เชียงราย'})
    city: string;

    @Column({ default: 'สำนักงานใหญ่'})
    branch: string;

    @Column({ type: 'enum', enum: StaffRole, default: StaffRole.STAFF })
    role: StaffRole;

  @Column({ type: 'enum', enum: StaffStatus, default: StaffStatus.ACTIVE })
  status: StaffStatus;

    @OneToMany(() => Quotation, (quotation) => quotation.staff)
    quotations: Quotation[];
}


