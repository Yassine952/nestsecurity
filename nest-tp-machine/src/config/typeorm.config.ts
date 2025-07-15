import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User, Role, Resource } from '../entities';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'app',
  entities: [User, Role, Resource],
  synchronize: true, // Only for development
  logging: true,
}; 