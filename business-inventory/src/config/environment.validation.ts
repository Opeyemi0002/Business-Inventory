import * as joi from 'joi';

export default joi.object({
  NODE_ENV: joi.string().required().default('development'),
  DB_PORT: joi.number().required(),
  DB_USERNAME: joi.string().required(),
  DB_PASSWORD: joi.string().required(),
  DB_NAME: joi.string().required(),
  DB_AUTOLOADENTITIES: joi.string().required(),
  DB_SYCHRONIZE: joi.string().required(),
  MAILTRAP_USERNAME: joi.string().required(),
  MAILTRAP_PASSWORD: joi.string().required(),
  MAILTRAP_HOST: joi.string().required(),
  MAILTRAP_PORT: joi.number().required(),
  JWT_SECRET: joi.string().required(),
  JWT_ISSUER: joi.string().required(),
  JWT_AUDIENCE: joi.string().required(),
  JWT_EXPIRY: joi.number().required(),
  JWT_REFRESH_TOKEN_TTL: joi.number().required(),
  GOOGLE_CLIENT_SECRET: joi.string().required(),
  GOOGLE_CLIENT_ID: joi.string().required(),
});
