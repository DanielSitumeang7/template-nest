import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard("jwt") {
    handleRequest<TUser = any>(
        err: Error | null,
        user: TUser | false,
        info: { message?: string } | undefined,
        context: ExecutionContext,
        status?: number,
    ): TUser {
        if (err || !user) {
            const message =
                info?.message || 'Token tidak valid atau sudah kedaluwarsa';
            throw new UnauthorizedException(message);
        }
        return user;
    }
}
