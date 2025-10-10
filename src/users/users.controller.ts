import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserSearch } from './validation/users.validation';
import { Response } from 'express';
import { JwtGuard } from 'src/auth/guards/jwt/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';

@Controller('users')
export class UsersController {

    constructor(
        private userService: UsersService
    ) {

    }

    @Get()
    @UseGuards(JwtGuard, RolesGuard)
    @Roles("admin")
    async getUsers(
        @Query() queries: UserSearch,
        @Res() res: Response
    ): Promise<Response> {

        const response = await this.userService.getUsers(queries);

        return res.status(response.code).send(response);
    }

}
