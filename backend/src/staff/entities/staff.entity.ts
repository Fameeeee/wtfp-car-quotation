import { Quotation } from "src/quotation/entities/quotation.entity";
import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

export enum StaffRole {
    STAFF = 'staff',
    MANAGER = 'manager',
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

    @Column({ type: 'enum', enum: StaffRole, default: StaffRole.STAFF })
    role: StaffRole;

    @OneToMany(() => Quotation, (quotation) => quotation.staff)
    quotations: Quotation[];
}


