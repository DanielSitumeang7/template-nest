import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './validation/validation.pipe';
import { BadRequestFilter } from './filters/bad-request/bad-request.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new BadRequestFilter())
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
