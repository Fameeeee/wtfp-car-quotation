import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Patch,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffLoginDto } from './dto/staff-login.dto';
import { Staff } from './entities/staff.entity';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('staff')
export class StaffController {
  private readonly logger = new Logger(StaffController.name);
  constructor(private readonly staffService: StaffService) { }

  @Get()
  async getAllStaff(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('search') search?: string
  ) {
    return await this.staffService.getAllStaff(page, limit, search);
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    return await this.staffService.findById(+id);
  }

  @Put(':id')
  async updateStaff(@Param('id') id: number, @Body() updateData: Partial<Staff>) {
  this.logger.log(`PUT /staff/${id}`);
  return await this.staffService.updateStaff(id, updateData);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles('manager')
  async updateRole(@Param('id') id: number, @Body() body: { role: string }) {
    return await this.staffService.updateStaff(id, { role: body.role as any });
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('manager')
  async updateStatus(@Param('id') id: number, @Body() body: { status: string; reassignTo?: number }) {
  this.logger.log(`PATCH /staff/${id}/status`);
  return await this.staffService.updateStatus(id, body.status, body.reassignTo);
  }

  @Delete(':id')
  async deleteStaff(@Param('id') id: number) {
  this.logger.log(`DELETE /staff/${id}`);
  return await this.staffService.deleteStaff(+id);
  }
}
