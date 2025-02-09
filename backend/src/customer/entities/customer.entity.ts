import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Quotation } from "src/quotation/entities/quotation.entity";

@Entity('customer')
export class Customer {
    @PrimaryGeneratedColumn() 
    id: number;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @OneToMany(() => Quotation, (quotation) => quotation.customer)
    quotations: Quotation[];
}
