import { Controller, Post, Body, Res, Get } from '@nestjs/common';
import { Response } from 'express';
import { IdParam } from './decorators/id-param.decorator';
import { AppService } from './app.service';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('createChartSession')
  createChartSession(@Res() res: Response, @Body('data') data: string) {
    return res.json(this.appService.createChartSession(data));
  }

  @Get('getMermaidCode/:id')
  getChart(@Res() res: Response, @IdParam() id: string) {
    const result = this.appService.getMermaidCode(id);

    if (!result) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.json(result);
  }
}
