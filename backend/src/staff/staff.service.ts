import {
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
  ) { }

  async registerStaff(createStaffDto: CreateStaffDto): Promise<Staff> {
    try {
      const existingStaff = await this.staffRepository.findOne({
        where: { email: createStaffDto.email },
      });
      if (existingStaff) {
        throw new ConflictException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(createStaffDto.password, 10);

      const newStaff = this.staffRepository.create({
        ...createStaffDto,
        password: hashedPassword,
      });

      return await this.staffRepository.save(newStaff);
    } catch (error) {
      throw error;
    }
  }

  async loginStaff(staffDto: any): Promise<any> {
    const { email, password } = staffDto;

    const staff = await this.staffRepository.findOne({ where: { email } });
    if (!staff) {
      throw new Error('Email not registered');
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const payload = { email: staff.email, sub: staff.id, role: staff.role };
    const token = this.jwtService.sign(payload);

    console.log('JWT Payload:', payload);
    return { token, role: staff.role };
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
    const staff = await this.staffRepository.findOne({ where: { id } })

    if (!staff) {
      throw new Error('Staff not found')
    }

    Object.assign(staff, updateData);
    return this.staffRepository.save(staff);
  }

  async deleteStaff(id: number): Promise<string> {
    const staff = await this.staffRepository.findOne({ where: { id } })

    if (!staff) {
      throw new Error('Staff not found')
    }

    await this.staffRepository.remove(staff);
    return 'Staff deleted successfully'
  }
}
