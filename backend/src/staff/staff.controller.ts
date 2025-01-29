import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffLoginDto } from './dto/staff-login.dto';



@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('register')
  async register(@Body() createStaffDto: CreateStaffDto) {
    const newStaff = await this.staffService.register(createStaffDto);
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
  async login(@Body() staffLoginDto: StaffLoginDto) {
    return this.staffService.login(staffLoginDto);  
  }

  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(+id, updateStaffDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(+id);
  }
}
