import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { AuthService } from './auth.service';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  // The CurrentUserInterceptor is provided globally to ensure that the current user is available in all requests.
  providers: [UsersService, AuthService, { provide: APP_INTERCEPTOR, useClass: CurrentUserInterceptor }],
  controllers: [UsersController],
  imports: [TypeOrmModule.forFeature([User])],
})
export class UsersModule {}
