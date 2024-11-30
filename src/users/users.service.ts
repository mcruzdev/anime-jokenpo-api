import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/sequelize';
import { randomUUID } from 'crypto';
import { BattleFinishedEvent as BattleFinishedEvent } from 'src/battle/battle.gateway';
import { User } from 'src/model/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private repository: typeof User,
  ) {}

  async createUser({ name, username, password }): Promise<string> {
    const userId = randomUUID().toString();

    await this.repository.create({
      id: userId,
      username,
      password,
      name,
    });

    return Promise.resolve(userId);
  }

  async findByUsername(username: string) {
    return await this.repository.findOne({
      where: {
        username: username,
      },
    });
  }

  async findById(id: string) {
    const user = await this.repository.findOne({
      where: {
        id: id,
      },
    });

    return user;
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async updateImage(id: string) {
    return await this.repository.update(
      {
        image: `${id}.png`,
      },
      {
        where: {
          id: id,
        },
      },
    );
  }

  @OnEvent('battle.finished')
  handleOnBattleFinishedEvent(data: BattleFinishedEvent[]) {
    console.log('battle finished', data);
  }
}
