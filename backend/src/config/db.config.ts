
import { Customer } from 'src/customer/entities/customer.entity';
import { Quotation } from 'src/quotation/entities/quotation.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

export default (): MysqlConnectionOptions => ({
  type: 'mysql',
  host: process.env.dbHost,
  port: +process.env.dbPort,
  username: process.env.dbUsername,
  password: process.env.dbPassword,
  database: process.env.dbName,
  synchronize: true,
  entities: [Staff, Customer, Quotation],
});
