import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('images')
@UseGuards(AuthGuard)
export class ImagesController {
  @Get(':image')
  downloadImage(@Res() res: Response, @Param('image') image: string) {
    res.sendFile(image, {
      root: './images',
    });
  }
}
