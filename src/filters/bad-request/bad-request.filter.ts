import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from 'src/logger/logger.service';

@Catch(BadRequestException)
export class BadRequestFilter<T> implements ExceptionFilter<BadRequestException> {

  constructor(
    private readonly logger : LoggerService
  ) {}

  catch(exception: BadRequestException, host: ArgumentsHost) {

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

    this.logger.warn(JSON.stringify(errors), BadRequestFilter.name);

    return response.status(400).send({
      status: "error",
      code: 400,
      message: "Terjadi error bad request",
      error: errors
    })

  }
}
