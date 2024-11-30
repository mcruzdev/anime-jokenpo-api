import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { dataBaseConfig } from './sqlite.config';
import { GameGateway } from './battle/battle.gateway';

import { AuthController } from './auth/auth.controller';

import { AuthModule } from './auth/auth.module';
import { User } from './model/user.model';
import { ImagesController } from './images/images.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthSocketInterceptor } from './auth/auth-socket.interceptor';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    SequelizeModule.forRoot(dataBaseConfig),
    SequelizeModule.forFeature([User]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AuthController, ImagesController],
  providers: [GameGateway, AuthSocketInterceptor],
})
export class AppModule {}
