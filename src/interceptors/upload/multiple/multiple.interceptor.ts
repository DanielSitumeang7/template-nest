import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  mixin,
  Type,
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';

/* ======================================================
 * PUBLIC TYPES
 * ====================================================== */

/**
 * Ekstensi file yang diizinkan (tanpa titik)
 */
export type FileExt =
  | 'jpg' | 'jpeg' | 'png' | 'gif'
  | 'pdf'
  | 'doc' | 'docx'
  | 'xls' | 'xlsx'
  | 'ppt' | 'pptx'
  | 'txt' | 'csv'
  | 'mp4' | 'avi' | 'mov' | 'mkv';

/**
 * Konfigurasi upload per field
 */
export interface UploadField {
  name: string;
  ext?: FileExt[];
  maxCount?: number;
  maxSizeMb?: number;
}

/**
 * File hasil upload yang SUDAH tervalidasi
 */
export interface UploadedFile extends Express.Multer.File {
  /** Ekstensi final hasil validasi */
  detectedExt: FileExt;

  /** MIME hasil magic number (trusted) */
  detectedMime: string;
}

/* ======================================================
 * INTERCEPTOR FACTORY
 * ====================================================== */

export function MultipleFilesInterceptor(
  uploadFields: UploadField[],
): Type<NestInterceptor> {

  @Injectable()
  class MixinInterceptor implements NestInterceptor {

    /* ================================
     * UTIL
     * ================================ */

    private mbToBytes(mb: number): number {
      return mb * 1024 * 1024;
    }

    private getFieldConfig(name: string): UploadField | undefined {
      return uploadFields.find(f => f.name === name);
    }

    /**
     * Normalisasi ekstensi:
     * - docx/xlsx/pptx → zip
     * - txt/csv → tidak punya magic number
     */
    private normalizeExt(
      detectedExt: string | undefined,
      originalExt: string,
    ): FileExt | undefined {

      if (detectedExt === 'zip') {
        if (['docx', 'xlsx', 'pptx'].includes(originalExt)) {
          return originalExt as FileExt;
        }
      }

      if (!detectedExt) {
        if (['txt', 'csv'].includes(originalExt)) {
          return originalExt as FileExt;
        }
      }

      return detectedExt as FileExt | undefined;
    }

    private getUploadPath(ext: FileExt): string {
      const now = new Date();

      let category = 'others';
      if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) category = 'images';
      else if (
        ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'].includes(ext)
      ) category = 'documents';
      else if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) category = 'videos';

      return join(
        process.cwd(),
        'uploads',
        category,
        ext,
        now.getFullYear().toString(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      );
    }

    private toUploadedFile(file: Express.Multer.File): UploadedFile {
      return file as UploadedFile;
    }

    /* ================================
     * INTERCEPT
     * ================================ */

    intercept(context: ExecutionContext, next: CallHandler) {

      const maxFileSize = Math.max(
        ...uploadFields
          .filter(f => f.maxSizeMb)
          .map(f => this.mbToBytes(f.maxSizeMb!)),
        0,
      );

      const multerInterceptor = FileFieldsInterceptor(uploadFields, {
        storage: memoryStorage(),

        limits: maxFileSize
          ? { fileSize: maxFileSize }
          : undefined,

        /**
         * Jangan lakukan magic number di sini.
         * File buffer BELUM tersedia.
         */
        fileFilter: (req, file, cb) => {
          const fieldConfig = this.getFieldConfig(file.fieldname);
          if (!fieldConfig) {
            return cb(
              new UnsupportedMediaTypeException(
                `Field "${file.fieldname}" tidak diizinkan`,
              ),
              false,
            );
          }
          cb(null, true);
        },
      });

      const instance = new (multerInterceptor as any)();

      return instance.intercept(context, {
        handle: async () => {

          const req = context.switchToHttp().getRequest();

          for (const field of uploadFields) {
            const files: Express.Multer.File[] | undefined =
              req.files?.[field.name];

            if (!files) continue;

            for (const file of files) {

              const originalExt = extname(file.originalname)
                .replace('.', '')
                .toLowerCase();

              /* ================================
               * MAGIC NUMBER
               * ================================ */

              const detected = await fileTypeFromBuffer(file.buffer);

              const finalExt = this.normalizeExt(
                detected?.ext,
                originalExt,
              );

              if (!finalExt) {
                throw new UnsupportedMediaTypeException(
                  'Tipe file tidak dapat dikenali',
                );
              }

              if (field.ext && !field.ext.includes(finalExt)) {
                throw new UnsupportedMediaTypeException(
                  `File ${finalExt} tidak diizinkan untuk field ${field.name}`,
                );
              }

              /* ================================
               * SAVE FILE
               * ================================ */

              const dir = this.getUploadPath(finalExt);
              fs.mkdirSync(dir, { recursive: true });

              const filename =
                `${Date.now()}-${Math.round(Math.random() * 1e9)}.${finalExt}`;

              const fullPath = join(dir, filename);
              fs.writeFileSync(fullPath, file.buffer);

              /* ================================
               * METADATA (TYPE-SAFE)
               * ================================ */

              const uploaded = this.toUploadedFile(file);
              uploaded.path = fullPath;
              uploaded.filename = filename;
              uploaded.detectedExt = finalExt;
              uploaded.detectedMime =
                detected?.mime ?? file.mimetype;
            }
          }

          return next.handle();
        },
      });
    }
  }

  return mixin(MixinInterceptor);
}
