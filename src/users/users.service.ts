import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ResponseDTO } from 'src/dto/response.dto';
import { GetUsersSearchParameter } from './types/userParameter.type';
import * as crypto from 'crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {

    constructor(
        private readonly DB: DatabaseService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache

    ) {

    }

    async getUsers({ name, email, address, phone_number, created_at, page, limit }: GetUsersSearchParameter): Promise<ResponseDTO> {

        const skip = page && limit ? Number(page - 1) * Number(limit) : undefined;
        const take = page ? Number(limit) : undefined;

        const rawKey = `users:${name}:${email}:${address}:${phone_number}:${created_at}:${page}:${limit}`;
        const key = crypto.createHash('md5').update(rawKey).digest('hex');

        const cachedData: ResponseDTO = await this.cacheManager.get(key);

        if (cachedData) {
            return cachedData;
        }

        const [data, total_data] = await Promise.all([
            this.DB.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    address: true,
                    phone_number: true,
                    created_at: true,
                    updated_at: true,
                    deleted_at: true
                },
                where: {
                    name,
                    email,
                    address,
                    phone_number,
                    created_at,
                    deleted_at: null
                },
                skip,
                take
            }),
            this.DB.user.count({
                where: {
                    name,
                    email,
                    address,
                    phone_number,
                    created_at,
                    deleted_at: null
                }
            })
        ])

        let total_page: number | undefined = undefined;

        if (page && limit) {
            total_page = Math.ceil(total_data / Number(limit));
        }

        const response: ResponseDTO = {
            status: "success",
            code: 200,
            message: "Data ditemukan",
            data: {
                data,
                current_page: Number(page) ?? undefined,
                limit: Number(limit),
                total_page
            }
        }

        await this.cacheManager.set(key, response, 900000 );

        return response;

    }

}
