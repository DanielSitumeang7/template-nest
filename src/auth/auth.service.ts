import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import { RegisterDTO, RegisterParameter } from './types/auth-result-type';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private readonly DB: DatabaseService,
        private jwtService: JwtService,
        private config: ConfigService,
    ) {

    }

    private saltRounds(): number {
        return Number(this.config.get<number>('BCRYPT_SALT_ROUNDS') ?? 12);
    }

    async register({ username, password, email, phone_number, address, name }: RegisterParameter): Promise<RegisterDTO> {
        try {
            const existUser = await this.DB.account.findUnique({ where: { username } });
            if (existUser) throw new BadRequestException(`Sudah ada akun dengan username ${username}`);

            const existEmail = await this.DB.user.findUnique({ where: { email } });
            if (existEmail) throw new BadRequestException('Email already registered');

            const hashed = await bcrypt.hash(password, this.saltRounds());

            const account = await this.DB.account.create({
                data: {
                    username: username,
                    password: hashed,
                    role: 'user',
                    User: {
                        create: {
                            name,
                            email,
                            address,
                            phone_number,
                        },
                    },
                },
                include: { User: true },
            });

            if (account.User) {
                return {
                    status : "success",
                    code : 200,
                    message : "Akun berhasil terdaftar",
                    data : account.User 
                }
            }
        }
        catch (err) {
            throw new BadRequestException('Email already registered');
        }
    }


}
