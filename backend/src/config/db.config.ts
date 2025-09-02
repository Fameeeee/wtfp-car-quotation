
import { Customer } from 'src/customer/entities/customer.entity';
import { Quotation } from 'src/quotation/entities/quotation.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { AuditLog } from 'src/audit/audit.entity';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

export default (): MysqlConnectionOptions => ({
  type: 'mysql',
  host: process.env.MYSQLHOST || process.env.dbHost,
  port: parseInt(process.env.MYSQLPORT || process.env.dbPort || '3306', 10),
  username: process.env.MYSQLUSER || process.env.dbUsername,
  password: process.env.MYSQLPASSWORD || process.env.dbPassword,
  database: process.env.MYSQLDATABASE || process.env.dbName,
  synchronize: true,
  entities: [Staff, Customer, Quotation, AuditLog],
});
