import { Module } from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { PdfService } from './pdf.service';
import { QuotationController } from './quotation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quotation } from './entities/quotation.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomerModule } from 'src/customer/customer.module';
import { StaffModule } from 'src/staff/staff.module';
import { AuditModule } from 'src/audit/audit.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quotation]),
    CustomerModule,
    StaffModule,
    AuditModule,
  AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [QuotationController],
  providers: [QuotationService, PdfService],
  exports: [QuotationService],
})
export class QuotationModule {}
