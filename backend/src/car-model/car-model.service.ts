import { Injectable } from '@nestjs/common';
import { CreateCarModelDto } from './dto/create-car-model.dto';
import { UpdateCarModelDto } from './dto/update-car-model.dto';
import { CarModel } from './entities/car-model.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CarModelDto } from './dto/car-model.dto';

@Injectable()
export class CarModelService {
  constructor(
    @InjectRepository(CarModel)
    private carModelRepository: Repository<CarModel>,
  ) {}

  create(createCarModelDto: CreateCarModelDto) {
    return 'This action adds a new carModel';
  }

  async findByName(name: string): Promise<CarModelDto[]> {
    const carModels = await this.carModelRepository.find({
      where: { name: ILike(name) },
      select: ['name', 'image_url', 'color'], 
    });

    return carModels; 
  }

  async findAll(): Promise<CarModel[]> {
    return await this.carModelRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} carModel`;
  }

  update(id: number, updateCarModelDto: UpdateCarModelDto) {
    return `This action updates a #${id} carModel`;
  }

  remove(id: number) {
    return `This action removes a #${id} carModel`;
  }
}
