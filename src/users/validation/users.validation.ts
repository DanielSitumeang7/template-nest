import { Transform } from "class-transformer";
import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";

export class UserSearch {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    phone_number?: string;

    @IsOptional()
    @IsDate()
    created_at?: Date;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    page? : number;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    limit? : number;
}