import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('images')
@ApiBearerAuth()
export class ImagesController {
  @Get(':image')
  downloadImage(@Res() res: Response, @Param('image') image: string) {
    res.sendFile(image, {
      root: './images',
    });
  }
}
