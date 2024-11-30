import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/model/user.model';
import { AuthSocketInterceptor } from './auth-socket.interceptor';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, AuthSocketInterceptor, UsersService],
  exports: [AuthService, AuthGuard, AuthSocketInterceptor],
})
export class AuthModule {}
