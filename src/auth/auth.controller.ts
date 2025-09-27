import { Body, Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { LoginDTO, RegisterDTO } from './validation/login.dto';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Account, User } from 'generated/prisma';
import { ResponseDTO } from 'src/dto/response.dto';
import { JwtGuard } from './guards/jwt/jwt.guard';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly Service: AuthService
    ) {

    }

    @Post('register')
    async registerAccount(
        @Body() data: RegisterDTO,
        @Res() res: Response
    ): Promise<Response> {

        const response = await this.Service.register(data);

        return res.status(response.code).send(response);
    }

    @Post('login')
    async login(
        @Body() dto: LoginDTO,
        @Res() res: Response
    ): Promise<Response> {

        const account: Account = await this.Service.validateUser(dto.username, dto.password);
        const response = await this.Service.login(account);

        return res.status(response.code).send(response);
    }

    @Post('refresh')
    async refresh(
        @Body() body: { accountId: string; refresh_token: string },
        @Res() res: Response
    ): Promise<Response> {
        const response = await this.Service.refreshToken(body.accountId, body.refresh_token);

        return res.status(response.code).send(response);
    }

    @UseGuards(JwtGuard)
    @Get('me')
    async me(
        @Request() req: { user: { id: string; username: string; role: string, data: User } },
        @Res() res: Response
    ): Promise<Response> {
        const response: ResponseDTO = {
            status: "success",
            code: 200,
            message: "Your Data",
            data: req.user
        }

        return res.status(response.code).send(response);
    }

    @UseGuards(JwtGuard)
    @Post('logout')
    async logout(
        @Request() req: { user: { id: string } },
        @Res() res : Response
    ) : Promise<Response> {
        const response =  await this.Service.logout(req.user.id);

        return res.status(response.code).send(response);
    }

}
