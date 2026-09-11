import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  host: process.env.DB_HOST as string,
  username: process.env.DB_USERNAME as string,
  password: process.env.DB_PASSWORD as string,
  name: process.env.DB_NAME as string,
  entities: process.env.DB_AUTOLOADENTITIES === 'true' ? true : false,
  synchronize: process.env.DB_SYCHRONIZE === 'true' ? true : false,
}));
