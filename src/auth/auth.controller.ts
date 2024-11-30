import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { InjectModel } from '@nestjs/sequelize';
import { randomUUID } from 'crypto';

import { User } from 'src/model/user.model';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly authService: AuthService,
  ) {}

  @Post('sign-up')
  async ignUp(@Res() res: Response, @Body() req: SignUpRequest) {
    await this.userModel.create({
      id: randomUUID().toString(),
      username: req.username,
      password: req.password,
      name: req.name,
    });

    return res.status(HttpStatus.CREATED).send();
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
