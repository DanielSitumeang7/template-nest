import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  mixin,
  Type,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Request } from 'express';
import * as fs from 'fs';

interface UploadField {
  name: string;
  maxCount?: number;
}

export function MultipleFilesInterceptor(
  uploadFields: UploadField[],
): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    private static readonly allowedExts = [
      '.jpg', '.jpeg', '.png', '.gif',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.ppt', '.pptx', '.csv',
      '.mp4', '.avi', '.mov', '.mkv',
    ];

    /**
     * Tentukan folder upload berdasarkan ekstensi file
     */
    private getUploadPath(file: Express.Multer.File): string {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const ext = extname(file.originalname).toLowerCase();

      let category = 'others';
      if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        category = 'images';
      } else if (['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'].includes(ext)) {
        category = 'documents';
      } else if (['.mp4', '.avi', '.mov', '.mkv'].includes(ext)) {
        category = 'videos';
      }

      return join(
        process.cwd(),
        'uploads',
        category,
        ext.replace('.', ''),
        `${year}`,
        `${month}`,
        `${day}`,
      );
    }

    intercept(context: ExecutionContext, next: CallHandler) {
      const multerInterceptor = FileFieldsInterceptor(uploadFields, {
        storage: diskStorage({
          destination: (req: Request, file, cb) => {
            const uploadPath = this.getUploadPath(file);
            fs.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
          },
          filename: (req: Request, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const fileExt = extname(file.originalname);
            cb(null, `${uniqueSuffix}${fileExt}`);
          },
        }),
        fileFilter: (req: Request, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          if (!MixinInterceptor.allowedExts.includes(ext)) {
            return cb(
              new UnsupportedMediaTypeException(`File type ${ext} is not supported`),
              false,
            );
          }
          cb(null, true);
        },
      });

      const instance = new (multerInterceptor as any)();
      return instance.intercept(context, next);
    }
  }

  return mixin(MixinInterceptor);
}
