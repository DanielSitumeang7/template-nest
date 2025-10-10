import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports : [CacheModule.register()],
})
export class UsersModule {}
