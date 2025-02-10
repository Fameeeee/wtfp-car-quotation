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

  @Post('register')
  async registerStaff(@Body() createStaffDto: CreateStaffDto) {
    const newStaff = await this.staffService.registerStaff(createStaffDto);
    return {
      message: 'Staff registered successfully',
      staff: {
        id: newStaff.id,
        firstName: newStaff.firstName,
        email: newStaff.email,
      },
    };
  }

  @Post('login')
  async loginStaff(@Body() staffLoginDto: StaffLoginDto) {
    return this.staffService.loginStaff(staffLoginDto);  
  }

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
