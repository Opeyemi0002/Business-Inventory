import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  username: process.env.MAILTRAP_USERNAME,
  password: process.env.MAILTRAP_PASSWORD,
  host: process.env.MAILTRAP_HOST,
  port: parseInt(process.env.MAILTRAP_PORT || '2525'),
}));
