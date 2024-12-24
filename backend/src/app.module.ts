import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StaffModule } from './staff/staff.module';
import { Staff } from './staff/entities/staff.entity';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: '192.168.1.15',
    port: 3306,
    username: 'fame',
    password: 'wtfp',
    database: 'isuzu',
    entities: [Staff],
    synchronize:true,
  })
    ,StaffModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
