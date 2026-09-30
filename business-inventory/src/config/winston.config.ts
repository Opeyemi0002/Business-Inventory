import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const WinstonConfig = WinstonModule.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/application.log',
    }),
  ],
});
