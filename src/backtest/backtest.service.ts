import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BacktestEngineService } from './engine/backtest-engine.service';

@Injectable()
export class BacktestService {
  constructor(private readonly engine: BacktestEngineService) {}

  async runBacktest(body: {
    symbol: string;
    from: string;
    to: string;
    strategy: string;
    params?: Record<string, any>;
  }) {
    const { symbol, from, to, strategy, params } = body;

    if (!symbol || !from || !to || !strategy) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
    }
    if (fromDate >= toDate) {
      throw new HttpException(
        '`from` must be before `to`',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.engine.execute({
      symbol,
      from: fromDate,
      to: toDate,
      strategy,
      params: params ?? {},
    });
  }
}
