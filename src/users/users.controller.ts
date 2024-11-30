import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { writeFile } from 'fs/promises';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get(':id')
  async getById(@Res() res: Response, @Param('id') id: string) {
    const user = await this.service.findById(id);
    return res.status(HttpStatus.OK).json({
      id: user.id,
      username: user.username,
      image: user.image,
    });
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    await writeFile(`images/${id}.png`, file.buffer);
    await this.service.updateImage(id);
  }
}
