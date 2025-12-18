import { ArgumentsHost, Catch, ExceptionFilter, UnsupportedMediaTypeException } from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from 'src/logger/logger.service';

@Catch()
export class UnsupportedMediaTypeExceptionFilter<T> implements ExceptionFilter {

  constructor(
    private readonly logger: LoggerService
  ) {}

  catch(exception: UnsupportedMediaTypeException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();

        const exceptionResponse = exception.getResponse() as
      | { message: string | string[]; error?: string; statusCode?: number }
      | string;

    let errors: any = {};

    if (typeof exceptionResponse === 'object' && Array.isArray(exceptionResponse['message'])) {
      // kalau ValidationPipe kirim array message
      errors = exceptionResponse['message'];
    } else if (typeof exceptionResponse === 'object') {
      // fallback kalau ada error lain
      errors = exceptionResponse['message'] ?? exceptionResponse;
    } else {
      // kalau benar-benar string
      errors = [exceptionResponse];
    }

    this.logger.warn(JSON.stringify(errors), UnsupportedMediaTypeException.name);

    return response.status(415).send({
      status: "error",
      code: 415,
      message: "Gagal mengupload file karena field tidak sesuai",
      error: errors
    })

  }
}
