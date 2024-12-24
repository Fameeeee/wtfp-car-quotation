import { CarModel } from 'src/car-model/entities/car-model.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { MysqlConnectionCredentialsOptions } from 'typeorm/driver/mysql/MysqlConnectionCredentialsOptions';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

export default (): MysqlConnectionOptions => ({
  type: 'mysql',
  host: 'localhost',
  port: +process.env.dbPort,
  username: process.env.dbUsername,
  password: process.env.dbPassword,
  database: process.env.dbName,
  synchronize: true,
  entities: [Staff, CarModel],
});
