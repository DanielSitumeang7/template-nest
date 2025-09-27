import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import { AuthTokens, LoginDTO, RegisterDTO, RegisterParameter } from './types/auth-result-type';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { Account, AuthActivity } from 'generated/prisma';
import { JwtPayload } from './types/jwt-payload.type';
import { randomBytes } from 'crypto';
import { ResponseDTO } from 'src/dto/response.dto';

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
                    status: "success",
                    code: 200,
                    message: "Akun berhasil terdaftar",
                    data: account.User
                }
            }
        }
        catch (err) {
            throw new BadRequestException('Email already registered');
        }
    }

    async validateUser(username: string, password: string): Promise<Account> {
        const account = await this.DB.account.findUnique({ where: { username } });
        if (!account) throw new UnauthorizedException(`Tidak ada akun dengan username : ${username}`);

        const isValid = await bcrypt.compare(password, account.password);
        if (!isValid) throw new UnauthorizedException('Password Anda Salah');

        return account;
    }

    private signAccessToken(account: Account): string {
        const payload: JwtPayload = { sub: account.id, username: account.username, role: account.role };
        return this.jwtService.sign(payload, {
            expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
        });
    }

    private async createAndStoreRefreshToken(accountId: string): Promise<string> {
        const raw = randomBytes(64).toString('hex'); // secure random
        const hash = await bcrypt.hash(raw, this.saltRounds());
        await this.DB.account.update({ where: { id: accountId }, data: { refresh_token_hash: hash } });
        return raw;
    }

    async login(account: Account): Promise<LoginDTO> {
        const access_token = this.signAccessToken(account);
        const refresh_token = await this.createAndStoreRefreshToken(account.id);

        await this.DB.authLog.create({ data: { account_id: account.id, activity: AuthActivity.login } });

        return {
            status: "success",
            code: 200,
            message: "Login Berhasil",
            data: {
                access_token, refresh_token
            }
        };
    }

    async refreshToken(accountId: string, providedToken: string): Promise<LoginDTO> {
        const account = await this.DB.account.findUnique({ where: { id: accountId } });
        if (!account || !account.refresh_token_hash) throw new UnauthorizedException('Invalid refresh token');

        const match = await bcrypt.compare(providedToken, account.refresh_token_hash);
        if (!match) {
            // possible reuse/compromise -> revoke all
            await this.DB.account.update({ where: { id: accountId }, data: { refresh_token_hash: null } });
            throw new UnauthorizedException('Refresh token invalid. Please login again.');
        }

        // rotate refresh token
        const newRefresh = await this.createAndStoreRefreshToken(accountId);
        const access_token = this.signAccessToken(account);
        return {
            status: "success",
            code: 200,
            message: "Token Direfresh",
            data: {
                access_token, refresh_token: newRefresh
            }
        };
    }

    async logout(accountId: string): Promise<ResponseDTO> {
        await this.DB.account.update({ where: { id: accountId }, data: { refresh_token_hash: null } });
        await this.DB.authLog.create({ data: { account_id: accountId, activity: AuthActivity.logout } });
        return {
            status : "success",
            code : 200,
            message : "Logout Berhasil. Sampai Jumpa Lagi."
        };
    }


}
