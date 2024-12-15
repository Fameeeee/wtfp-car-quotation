import { ConflictException, Injectable } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async create(createStaffDto: CreateStaffDto): Promise<Staff> {
    try {
      const newStaff = this.staffRepository.create(createStaffDto);
      return await this.staffRepository.save(newStaff);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        const duplicateField = this.getDuplicateField(error.message);
        throw new ConflictException(`${duplicateField} already exists`);
      }
    }
  }
  private getDuplicateField(errorMessage: string): string {
    if (errorMessage.includes('lastName')) return 'Last name';
    if (errorMessage.includes('email')) return 'Email';
    if (errorMessage.includes('phoneNumber')) return 'Phone number';
    return 'Field';
  }

  findAll() {
    return this.staffRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} staff`;
  }

  update(id: number, updateStaffDto: UpdateStaffDto) {
    return `This action updates a #${id} staff`;
  }

  remove(id: number) {
    return `This action removes a #${id} staff`;
  }
}
