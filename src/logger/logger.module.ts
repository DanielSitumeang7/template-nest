import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';

function getLogPath(filename: string) {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');

  const dir = path.join('logs', year, month, date);
  fs.mkdirSync(dir, { recursive: true });

  return path.join(dir, filename);
}

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
            })
          ),
        }),

        new winston.transports.File({
          filename: getLogPath('error.log'),
          level: 'error',
          format: winston.format.json(),
        }),

        new winston.transports.File({
          filename: getLogPath('combined.log'),
          format: winston.format.json(),
        }),

        new winston.transports.File({
          filename: getLogPath('debug.log'),
          level: 'debug',
          format: winston.format.json(),
        }),

        new winston.transports.File({
          filename: getLogPath('warn.log'),
          level: 'warn',
          format: winston.format.json(),
        }),
      ],
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService, WinstonModule],
})
export class LoggerModule {}
