import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    private jwtService: JwtService,
  ) {}

  async findByEmail(email: string): Promise<Staff | null> {
    return this.staffRepository.findOne({ where: { email } });
  }

  async createStaff(staffData: Partial<Staff>): Promise<void> {
    const { email, firstName, lastName, phoneNumber } = staffData;
  
    const existingStaff = await this.staffRepository.findOne({
      where: [{ email }, { firstName }, { lastName }, { phoneNumber }],
    });
  
    const duplicateFields = [];
  
    if (existingStaff) {
      if (existingStaff.email === email) duplicateFields.push('email');
      if (existingStaff.firstName === firstName) duplicateFields.push('firstName');
      if (existingStaff.lastName === lastName) duplicateFields.push('lastName');
      if (existingStaff.phoneNumber === phoneNumber) duplicateFields.push('phoneNumber');
      
      throw new BadRequestException(`Duplicate fields: ${duplicateFields.join(', ')}`);
    }
  
    const hashedPassword = await bcrypt.hash(staffData.password, 10);
    staffData.password = hashedPassword;
  
    await this.staffRepository.save(staffData);
  }
  

  async getAllStaff(): Promise<Staff[]> {
    return await this.staffRepository.find();
  }

  async findById(id: number): Promise<Staff | null> {
    return this.staffRepository.findOne({
      where: { id },
      relations: ['quotations'],
    });
  }

  async updateStaff(id: number, updateData: Partial<Staff>): Promise<Staff> {
    const staff = await this.staffRepository.findOne({ where: { id } });

    if (!staff) {
      throw new Error('Staff not found');
    }

    Object.assign(staff, updateData);
    return this.staffRepository.save(staff);
  }

  async deleteStaff(id: number): Promise<string> {
    const staff = await this.staffRepository.findOne({ where: { id } });

    if (!staff) {
      throw new Error('Staff not found');
    }

    await this.staffRepository.remove(staff);
    return 'Staff deleted successfully';
  }
}
