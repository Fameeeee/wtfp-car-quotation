import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

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

}


