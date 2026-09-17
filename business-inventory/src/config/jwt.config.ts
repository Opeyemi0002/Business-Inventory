import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET as string,
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
  expiresIn: parseInt(process.env.JWT_EXPIRY || '3600'),
  refreshTTL: parseInt(process.env.JWT_REFRESH_TOKEN_TTL || '6000'),
}));
