import { SearchParams } from "src/dto/response.dto";

export interface GetUsersSearchParameter extends SearchParams {
    name?: string;
    email?: string;
    address?: string;
    phone_number?: string;
    created_at?: Date;
}