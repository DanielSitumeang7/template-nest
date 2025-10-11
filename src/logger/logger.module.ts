import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, context }) => {
              return `[${timestamp}] [${level}]${context ? ' [' + context + ']' : ''}: ${message}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.json(),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.json(),
        }),
        new winston.transports.File({
          filename: 'logs/debug.log',
          level: 'debug',
          format: winston.format.json(),
        }),
      ],
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService, WinstonModule]
})
export class LoggerModule {}
