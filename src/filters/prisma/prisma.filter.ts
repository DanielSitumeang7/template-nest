import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientValidationError } from 'generated/prisma/runtime/library';

@Catch(
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
  PrismaClientUnknownRequestError
)
export class PrismaFilter<T> implements ExceptionFilter<PrismaClientKnownRequestError | PrismaClientValidationError | PrismaClientInitializationError | PrismaClientUnknownRequestError> {

  catch(exception: PrismaClientKnownRequestError | PrismaClientValidationError | PrismaClientInitializationError | PrismaClientUnknownRequestError, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();

    response.status(500).json({
      status: "error",
      code : 500,
      message: `Internal Server Error`,
      error: `Mohon Maaf.Terjadi Kesalahan Sistem pada Database Kami.`
    });
  }
}
