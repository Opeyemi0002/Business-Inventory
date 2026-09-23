import { registerAs } from '@nestjs/config';

export default registerAs('google', () => ({
  secret: process.env.GOOGLE_CLIENT_SECRET,
  id: process.env.GOOGLE_CLIENT_ID,
}));
