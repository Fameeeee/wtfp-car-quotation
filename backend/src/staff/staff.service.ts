import { BadRequestException, ConflictException, Injectable, UnauthorizedException, NotFoundException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Quotation } from 'src/quotation/entities/quotation.entity';
import { AuditService } from 'src/audit/audit.service';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
    private jwtService: JwtService,
    private readonly auditService: AuditService,
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
      if (existingStaff.firstName === firstName)
        duplicateFields.push('firstName');
      if (existingStaff.lastName === lastName) duplicateFields.push('lastName');
      if (existingStaff.phoneNumber === phoneNumber)
        duplicateFields.push('phoneNumber');

      throw new BadRequestException(
        `Duplicate fields: ${duplicateFields.join(', ')}`,
      );
    }

    const hashedPassword = await bcrypt.hash(staffData.password, 10);
    staffData.password = hashedPassword;

    await this.staffRepository.save(staffData);
  }

  async getAllStaff(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    data: {
      id: number;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      city: string;
    }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.staffRepository.createQueryBuilder('staff');

    if (search) {
      queryBuilder.andWhere(
        `(
          LOWER(staff.id) LIKE :search OR 
          LOWER(staff.firstName) LIKE :search OR 
          LOWER(staff.lastName) LIKE :search OR 
          LOWER(staff.email) LIKE :search OR 
          LOWER(staff.phoneNumber) LIKE :search
        )`,
        { search: `%${search.toLowerCase()}%` },
      );
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('staff.id', 'DESC');

    const data = await queryBuilder.getMany();

    const modifiedData = data.map((staff) => ({
      id: staff.id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      phoneNumber: staff.phoneNumber,
      city: staff.city,
      role: staff.role,
      status: staff.status,
    }));

    return {
      data: modifiedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Partial<Staff> | null> {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['quotations', 'quotations.customer'],
    });

    if (!staff) {
      return null;
    }

    const { password, ...staffWithoutPassword } = staff;

    return staffWithoutPassword;
  }

  async updateStaff(id: number, updateData: Partial<Staff>): Promise<Staff> {
    const staff = await this.staffRepository.findOne({ where: { id } });

  if (!staff) throw new NotFoundException('Staff not found');

  Object.assign(staff, updateData);
  const saved = await this.staffRepository.save(staff);
  this.logger.log(`Staff updated id=${saved.id}`);
  return saved;
  }

  // Update staff status and optionally reassign their quotations to another staff
  async updateStatus(
    id: number,
    status: string,
    reassignTo?: number,
  ): Promise<Staff> {
  const staff = await this.staffRepository.findOne({ where: { id } });
  if (!staff) throw new NotFoundException('Staff not found');

  staff.status = status as any;
  const saved = await this.staffRepository.save(staff);

    // Optionally reassign quotations
    if (reassignTo && reassignTo !== id) {
      await this.quotationRepository
        .createQueryBuilder()
        .update()
        .set({ staff: { id: reassignTo } as any })
        .where('staffId = :id', { id })
        .execute();
      try {
        await this.auditService.record('update', 'staff', id, null, {
          status,
          reassignTo,
        });
      } catch (e) {}
    } else {
      try {
        await this.auditService.record('update', 'staff', id, null, { status });
      } catch (e) {}
    }

    return saved;
  }

  async deleteStaff(id: number): Promise<string> {
    const staff = await this.staffRepository.findOne({ where: { id } });

  if (!staff) throw new NotFoundException('Staff not found');

  await this.staffRepository.remove(staff);
  this.logger.log(`Staff deleted id=${id}`);
  return 'Staff deleted successfully';
  }
}
