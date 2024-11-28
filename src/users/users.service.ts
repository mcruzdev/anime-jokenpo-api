import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/models/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private repository: typeof User,
  ) {}
}
