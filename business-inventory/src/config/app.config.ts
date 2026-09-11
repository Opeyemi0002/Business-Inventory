import { registerAs } from '@nestjs/config';
export default registerAs('app', () => ({
  config: process.env.NODE_ENV,
}));
