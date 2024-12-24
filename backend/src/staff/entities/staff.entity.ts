import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'staff'})
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

    @Column()
    age: number;

    @Column({unique: true})
    phoneNumber: string;
}


