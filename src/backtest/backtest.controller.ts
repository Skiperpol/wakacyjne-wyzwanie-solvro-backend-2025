import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { BacktestService } from './backtest.service';

interface RunBacktestBody {
  symbol: string;
  from: string; // ISO date
  to: string; // ISO date
  strategy: string;
  params?: Record<string, any>;
}

@Controller('backtests')
export class BacktestController {
  constructor(private readonly backtestService: BacktestService) {}

  @Post('run')
  async run(@Body() body: RunBacktestBody) {
    try {
      const result = await this.backtestService.runBacktest(body);
      return result;
    } catch (e: unknown) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException('Failed to run backtest', HttpStatus.BAD_REQUEST);
    }
  }
}
