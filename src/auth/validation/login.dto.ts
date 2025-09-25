import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsStrongPassword } from "class-validator";

export class LoginDTO {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class RegisterDTO {
    @IsNotEmpty({message : "username harus diisi"})
    @IsString({message : "username harus bertipe string"})
    username: string;

    @IsNotEmpty({message : "password harus diisi"})
    @IsString({message : "password harus bertipe string"})
    @IsStrongPassword({minLength : 12, minNumbers : 1, minUppercase : 1, minSymbols : 1}, {message : "password harus minimal 12 karakter yang mengandung huruf kapital, huruf kecil, angka, dan simbol-simbol"})
    password: string;

    @IsNotEmpty({message : "nama harus diisi"})
    @IsString({message : "nama harus bertipe string"})
    name: string;

    @IsNotEmpty({message : "email harus diisi"})
    @IsString({message : "email harus bertipe string"})
    @IsEmail({}, {message : "harus sesuai dengan format email"})
    email: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    @IsPhoneNumber()
    phone_number?: string;
}