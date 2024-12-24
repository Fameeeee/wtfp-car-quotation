import { Module } from '@nestjs/common';
import { CarModelService } from './car-model.service';
import { CarModelController } from './car-model.controller';
import { CarModel } from './entities/car-model.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CarModel])],
  controllers: [CarModelController],
  providers: [CarModelService],
})
export class CarModelModule {}
