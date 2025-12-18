import { Controller, Post, Res, UploadedFile, UploadedFiles, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { JwtGuard } from 'src/auth/guards/jwt/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { UnsupportedMediaTypeExceptionFilter } from 'src/filters/unsupported-media-type-exception/unsupported-media-type-exception.filter';
import { MultipleFilesInterceptor } from 'src/interceptors/upload/multiple/multiple.interceptor';
import { SingleFileInterceptor } from 'src/interceptors/upload/single/single.interceptor';

@Controller('files')
export class FilesController {

    @Post("upload-single")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles("admin")
    @UseInterceptors(SingleFileInterceptor('file'))
    async uploadSingle(
        @UploadedFile() file: Express.Multer.File,
        @Res() res: Response
    ): Promise<Response> {

        if (!file) {
            return res.status(400).send({
                status: "error",
                message: "No file uploaded",
                data: null
            });
        }

        return res.status(200).send({
            status: "success",
            message: "File uploaded successfully",
            data: file
        });
    }

    @Post("upload-multiple")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles("admin")
    @UseFilters(UnsupportedMediaTypeExceptionFilter)
    @UseInterceptors(MultipleFilesInterceptor([
        { name: 'foto', maxCount: 2, ext: ["jpg","png"] },
        { name: 'dokumen', maxCount: 3 },
        { name: 'video', maxCount: 1 }
    ]))
    async uploadMultiple(
        @UploadedFiles() file: { [fieldname: string]: Express.Multer.File[] },
        @Res() res: Response
    ): Promise<Response> {

        const savedFiles = [];

        Object.keys(file).forEach(key => {
            file[key].forEach(f => {
                savedFiles.push(f);
            })
        });

        if (savedFiles.length === 0) {
            return res.status(400).send({
                status: "error",
                message: "No file uploaded",
                code : 400
            });
        }

        return res.status(201).send({
            status: "success",
            message: "File uploaded successfully",
            code : 201
        });
    }

}
