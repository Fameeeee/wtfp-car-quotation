import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditLogGateway } from './audit.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditService, AuditLogGateway],
  controllers: [AuditController],
  exports: [AuditService, AuditLogGateway],
})
export class AuditModule {}
