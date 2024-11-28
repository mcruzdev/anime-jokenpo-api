import { SequelizeModuleOptions } from '@nestjs/sequelize';

export const dataBaseConfig: SequelizeModuleOptions = {
  dialect: 'sqlite',
  storage: 'anime-jokenpo.db',
  autoLoadModels: true,
  synchronize: false,
};
