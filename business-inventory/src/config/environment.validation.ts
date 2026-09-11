import * as joi from 'joi';

export default joi.object({
  NODE_ENV: joi.string().required().default('development'),
  DB_PORT: joi.number().required(),
  DB_USERNAME: joi.string().required(),
  DB_PASSWORD: joi.string().required(),
  DB_NAME: joi.string().required(),
  DB_AUTOLOADENTITIES: joi.string().required(),
  DB_SYCHRONIZE: joi.string().required(),
});
