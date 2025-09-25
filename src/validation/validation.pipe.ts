
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException(this.formatErrors(errors));
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]) {
    const result: Record<string, string[]> = {};

    errors.forEach((err) => {
      if (err.constraints) {
        result[err.property] = Object.values(err.constraints);
      }

      // kalau nested DTO
      if (err.children && err.children.length > 0) {
        Object.assign(result, this.formatErrors(err.children));
      }
    });

    return result;
  }
}
