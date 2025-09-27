import { SetMetadata } from '@nestjs/common';
import { AccountRole } from 'generated/prisma';

export const Roles = (...args: AccountRole[]) => SetMetadata('roles', args);
