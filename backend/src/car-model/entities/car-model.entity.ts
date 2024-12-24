import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('car_models')
export class CarModel {
    map(arg0: (carModel: any) => { name: any; image_url: any; color: any; }) {
      throw new Error('Method not implemented.');
    }
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    image_url: string;

    @Column()
    color: string;
}
