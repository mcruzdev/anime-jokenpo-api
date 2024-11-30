import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { InjectModel } from '@nestjs/sequelize';

import { User } from 'src/model/user.model';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('sign-up')
  async ignUp(@Res() res: Response, @Body() req: SignUpRequest) {
    const existentUser = await this.userService.findByUsername(req.username);
    if (existentUser) {
      return res.status(HttpStatus.CONFLICT).json({
        title: 'Conflict',
        message: 'This username is already in use',
      });
    }

    const userId = await this.userService.createUser({
      name: req.name,
      password: req.password,
      username: req.username,
    });

    return res
      .status(HttpStatus.CREATED)
      .setHeader('Location', `/users/${userId}`)
      .send();
  }

  @Post('sign-in')
  async signIn(@Res() res: Response, @Body() req: SignInRequest) {
    const user = await this.userModel.findOne({
      where: {
        username: req.username,
      },
    });

    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        title: 'Unauthorized',
        message: 'Invalid username or password',
      });
    }

    const token = this.authService.generateToken({
      sub: user.id,
      username: user.username,
    });

    return res.status(HttpStatus.OK).json({
      accessToken: token,
      user: {
        id: user.id,
        username: user.username,
        image: user.image,
      },
    } as SignInResponse);
  }
}

interface SignUpRequest {
  username: string;
  password: string;
  name: string;
}
interface SignInRequest {
  username: string;
  password: string;
}

interface SignInResponse {
  accessToken: string;
}
