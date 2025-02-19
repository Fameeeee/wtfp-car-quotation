import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffLoginDto } from './dto/staff-login.dto';
import { Staff } from './entities/staff.entity';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  async getAllStaff() {
    return await this.staffService.getAllStaff();
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    return await this.staffService.findById(+id);
  }

  @Put(':id')
  async updateStaff(@Param('id') id: number, @Body() updateData: Partial<Staff>) {
    return await this.staffService.updateStaff(id, updateData);
  }

  @Delete(':id')
  async deleteStaff(@Param('id') id: number) {
    return await this.staffService.deleteStaff(+id);
  }
}
