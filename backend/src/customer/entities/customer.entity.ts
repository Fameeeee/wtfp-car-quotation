import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Quotation } from "src/quotation/entities/quotation.entity";

@Entity('customer')
export class Customer {
    @PrimaryGeneratedColumn() 
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    phoneNumber: number;

    @OneToMany(() => Quotation, (quotation) => quotation.customer)
    quotations: Quotation[];
}
