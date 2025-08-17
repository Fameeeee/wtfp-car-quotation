import { Customer } from "src/customer/entities/customer.entity";
import { Staff } from "src/staff/entities/staff.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum PaymentMethod {
    CASH = 'cash',
    INSTALLMENT = 'installment'
}

@Entity('quotation')
export class Quotation {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamp' })
    quotationDate: Date;

    @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
    paymentMethod: PaymentMethod

    @Column({ type: 'json', nullable: true })
    cashPlans?: {
        totalPrice?: number;
        specialDiscount?: number;
        additionPrice?: number;
    }

    @Column({ type: 'json', nullable: true })
    installmentPlans?: {
        orderNumber: number;
        specialDiscount?: number;
        additionPrice?: number;
        downPaymentPercent?: number;
        planDetails: {
            period: number;
            interestRate: number;
        }[];
    }[];

    @Column({ type: 'json', nullable: true })
    additionCosts?: {
        cmi: boolean;
        insurance: boolean;
        fuelValue?: number;
        note?: string;
    }

    @Column({ type: 'json' })
    carDetails: {
        unitType: string;
        modelClass: string;
        modelCodeName: string;
        modelGName: string;
        price: number;
        color: string;
    };

    @Column({ type: 'json', nullable: true })
    accessories?: {
        assType: string;
        assName: string;
        price: number;
    }[];

    @ManyToOne(() => Staff, (staff) => staff.quotations, { onDelete: 'SET NULL', nullable: true })
    staff: Staff;

    @ManyToOne(() => Customer, (customer) => customer.quotations, { onDelete: 'SET NULL', nullable: true })
    customer: Customer;
}
