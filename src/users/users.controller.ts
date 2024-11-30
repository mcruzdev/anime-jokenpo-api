import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { writeFile } from 'fs/promises';
import { AuthService } from 'src/auth/auth.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get(':id')
  async getById(@Res() res: Response, @Param('id') id: string) {
    const user = await this.userService.findById(id);
    return res.status(HttpStatus.OK).json({
      id: user.id,
      username: user.username,
      image: user.image || 'images/default.png',
    });
  }

  @Get()
  async getAll() {
    return (await this.userService.findAll()).map((user) => {
      return {
        id: user.id,
        username: user.username,
        image: `images/${user.image || 'default.png'}`,
        score: user.score,
      };
    });
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const authroization = req.headers.authorization;
    const [, token] = authroization.split(' ');
    const sub = this.authService.getSub(token);

    if (sub != id) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have permissions',
      });
    }

    await writeFile(`images/${id}.png`, file.buffer);

    await this.userService.updateImage(id);

    return res.status(HttpStatus.OK).send();
  }
}
