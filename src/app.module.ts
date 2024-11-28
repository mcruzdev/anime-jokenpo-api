import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { dataBaseConfig } from './sqlite.config';

@Module({
  imports: [UsersModule, SequelizeModule.forRoot(dataBaseConfig)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
