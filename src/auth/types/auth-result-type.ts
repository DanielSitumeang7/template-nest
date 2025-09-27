import { User } from "generated/prisma";
import { ResponseDTO } from "src/dto/response.dto";

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface RegisterParameter {
  username: string;
  password: string;
  name: string;
  email: string;
  address?: string;
  phone_number?: string;
}

export interface RegisterDTO extends ResponseDTO {
  data? : User
}

export interface LoginDTO extends ResponseDTO {
  data : AuthTokens
}
