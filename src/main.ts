import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './pipe/validation/validation.pipe';
import { BadRequestFilter } from './filters/bad-request/bad-request.filter';
import { UnauthorizedFilter } from './filters/unauthorized/unauthorized.filter';
import { PrismaFilter } from './filters/prisma/prisma.filter';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())

  const logger = app.get(LoggerService);

  app.useGlobalFilters(new BadRequestFilter(logger), new UnauthorizedFilter(logger), new PrismaFilter(logger))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
