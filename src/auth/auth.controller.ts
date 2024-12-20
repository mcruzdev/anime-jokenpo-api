import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { InjectModel } from '@nestjs/sequelize';

import { User } from 'src/model/user.model';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateTokenRequest {
  @ApiProperty({
    type: 'string',
    name: 'token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZDYwM2MxOS1kOWQ0LTQ0ZWEtYTg4Yy0xODA1ZjAwODBhMDAiLCJ1c2VybmFtZSI6Imdva3UiLCJpYXQiOjE3MzI5ODc2MzV9.Ea3n0FyKoy1Y09bHSe9e2RJTNFvblTPxOc-EgB3mDZ0',
  })
  token: string;
}

export class SignUpRequest {
  @ApiProperty({
    type: 'string',
    name: 'username',
    example: 'goku',
  })
  username: string;

  @ApiProperty({
    type: 'string',
    name: 'password',
    example: 'secure@password',
  })
  password: string;

  @ApiProperty({
    type: 'string',
    name: 'name',
    example: 'Son Goku',
  })
  name: string;
}

export class SignInRequest {
  @ApiProperty({
    type: 'string',
    name: 'username',
    example: 'goku',
  })
  username: string;
  @ApiProperty({
    type: 'string',
    name: 'password',
    example: 'secure@password',
  })
  password: string;
}

export class SignInResponse {
  @ApiProperty({
    type: 'string',
    name: 'accessToken',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZDYwM2MxOS1kOWQ0LTQ0ZWEtYTg4Yy0xODA1ZjAwODBhMDAiLCJ1c2VybmFtZSI6Imdva3UiLCJpYXQiOjE3MzI5ODc2MzV9.Ea3n0FyKoy1Y09bHSe9e2RJTNFvblTPxOc-EgB3mDZ0',
  })
  accessToken: string;
  user: UserSignInResponse;
}

export class UserSignInResponse {
  @ApiProperty({
    type: 'string',
    name: 'id',
    example: '5d603c19-d9d4-44ea-a88c-1805f0080a02',
  })
  id: string;
  @ApiProperty({
    type: 'string',
    name: 'name',
    example: 'Son Goku',
  })
  name: string;
  @ApiProperty({
    type: 'string',
    name: 'username',
    example: 'goku',
  })
  username: string;
  @ApiProperty({
    type: 'string',
    name: 'image',
    example: 'images/default.png',
  })
  image: string;
}

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
        password: req.password,
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
        name: user.name,
        username: user.username,
        image: user.image || 'images/default.png',
      },
    } as SignInResponse);
  }

  @Post('validate')
  async validate(@Res() res: Response, @Body() req: ValidateTokenRequest) {
    const verified = this.authService.verifyToken(req.token);

    res.status(HttpStatus.OK).send({
      valid: verified,
    });
  }
}
