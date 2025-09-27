import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ResponseDTO } from 'src/dto/response.dto';
import { GetUsersSearchParameter } from './types/userParameter.type';

@Injectable()
export class UsersService {

    constructor(
        private readonly DB: DatabaseService
    ) {

    }

    async getUsers({ name, email, address, phone_number, created_at, page, limit }: GetUsersSearchParameter): Promise<ResponseDTO> {

        const skip = page && limit ? Number(page - 1) * Number(limit) : undefined;
        const take = page ? Number(limit) : undefined;


        const data = await this.DB.user.findMany({
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
        });

        let total_page: number | undefined = undefined;

        if (page && limit) {
            const total_data = await this.DB.user.count({
                where: {
                    name,
                    email,
                    address,
                    phone_number,
                    created_at,
                    deleted_at: null
                }
            });

            total_page = Math.ceil(total_data / Number(limit));
        }

        return {
            status: "success",
            code: 200,
            message: "Data ditemukan",
            data: {
                data,
                current_page: Number(page) ?? undefined,
                limit : Number(limit),
                total_page
            }
        }

    }

}
