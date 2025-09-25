import { Body, Controller, Post, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { RegisterDTO } from './validation/login.dto';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly Service: AuthService
    ) {

    }

    @Post('register')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true,  }))
    async registerAccount(
        @Body() data: RegisterDTO,
        @Res() res: Response
    ): Promise<Response> {
        
        const response = await this.Service.register(data);

        return res.status(response.code).send(response);
    }

}
