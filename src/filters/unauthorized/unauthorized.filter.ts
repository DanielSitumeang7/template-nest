import { ArgumentsHost, Catch, ExceptionFilter, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from 'src/logger/logger.service';

@Catch(UnauthorizedException)
export class UnauthorizedFilter<T> implements ExceptionFilter<UnauthorizedException> {

  constructor(
    private readonly logger : LoggerService
  ){}

  catch(exception: UnauthorizedException, host: ArgumentsHost) {
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

    this.logger.warn(JSON.stringify(errors), UnauthorizedFilter.name);

    return response.status(401).send({
      status: "error",
      code: 401,
      message: "Unauthorized",
      error: errors
    })
  }
}
