import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CarModelService } from './car-model.service';
import { CreateCarModelDto } from './dto/create-car-model.dto';
import { UpdateCarModelDto } from './dto/update-car-model.dto';

@Controller('car-model')
export class CarModelController {
  constructor(private readonly carModelService: CarModelService) {}

  @Post()
  create(@Body() createCarModelDto: CreateCarModelDto) {
    return this.carModelService.create(createCarModelDto);
  }

  @Get(':name')
  async findByName(@Param('name') name: string) {
    const decodedName = decodeURIComponent(name);
    const carModel = await this.carModelService.findByName(decodedName);
    if (carModel) {
      return carModel.map((carModel) => ({
        name: carModel.name,
        image_url: carModel.image_url,
        color: carModel.color,
      }));
    }
    return { message: 'Model not found' };
  }

  @Get()
  async findAll() {
    return await this.carModelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carModelService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCarModelDto: UpdateCarModelDto,
  ) {
    return this.carModelService.update(+id, updateCarModelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carModelService.remove(+id);
  }
}
