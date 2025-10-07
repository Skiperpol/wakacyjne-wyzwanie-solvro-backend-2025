import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { IStrategy } from '../strategies/strategy.interface';
import { EmaCrossoverStrategy } from '../strategies/ema-crossover.strategy';

type Candle = {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
};

@Injectable()
export class BacktestEngineService {
  async execute(input: {
    symbol: string;
    from: Date;
    to: Date;
    strategy: string;
    params: Record<string, any>;
  }) {
    const { symbol, from, to, strategy, params } = input;
    const data = await this.getHistoricalData(symbol, from, to);
    if (!data.length) {
      throw new HttpException(
        'No data returned from Binance',
        HttpStatus.BAD_REQUEST,
      );
    }

    const strategyImpl = this.getStrategy(strategy, params);
    const { profit, winRate, trades, wins, losses } = this.runBacktest(
      strategyImpl,
      data,
    );

    return {
      symbol,
      strategy,
      params,
      results: { profit, winRate, trades, wins, losses },
    };
  }

  async getHistoricalData(
    symbol: string,
    from: Date,
    to: Date,
  ): Promise<Candle[]> {
    const interval = '1h';
    const limit = 1000;
    const baseUrl = 'https://api.binance.com/api/v3/klines';

    const startTime = from.getTime();
    const endTime = to.getTime();

    const candles: Candle[] = [];
    let fetchStart = startTime;

    type BinanceKline = [
      number,
      string,
      string,
      string,
      string,
      string,
      number,
      string,
      number,
    ];

    while (fetchStart < endTime) {
      const params: Record<string, string | number | undefined> = {
        symbol,
        interval,
        startTime: fetchStart,
        endTime,
        limit,
      };

      const url = `${baseUrl}`;
      const res: AxiosResponse<BinanceKline[]> = await axios.get(url, {
        params,
      });
      const arr = res.data;
      if (!Array.isArray(arr) || arr.length === 0) {
        break;
      }

      for (const k of arr) {
        const c: Candle = {
          openTime: k[0],
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
          closeTime: k[6],
        };
        candles.push(c);
      }

      const last: BinanceKline = arr[arr.length - 1];
      const lastCloseTime = last[6];
      const nextStart = lastCloseTime + 1;
      if (nextStart <= fetchStart) {
        break;
      }
      fetchStart = nextStart;

      await new Promise((r) => setTimeout(r, 250));
    }

    return candles.filter(
      (c) => c.openTime >= startTime && c.closeTime <= endTime,
    );
  }

  getStrategy(name: string, params: Record<string, any>): IStrategy {
    switch (name) {
      case 'ema_crossover':
        return new EmaCrossoverStrategy({
          shortEma: Number(params?.shortEma ?? 10),
          longEma: Number(params?.longEma ?? 30),
        });
      default:
        throw new HttpException('Unknown strategy', HttpStatus.BAD_REQUEST);
    }
  }

  runBacktest(strategy: IStrategy, data: Candle[]) {
    let position: 'long' | null = null;
    let entryPrice = 0;
    let profit = 0;
    let trades = 0;
    let wins = 0;
    let losses = 0;

    for (const candle of data) {
      const signal = strategy.generateSignal(candle);
      if (signal === 'BUY') {
        if (!position) {
          position = 'long';
          entryPrice = candle.close;
        }
      } else if (signal === 'SELL') {
        if (position === 'long') {
          const tradePnL = (candle.close - entryPrice) / entryPrice;
          profit += tradePnL;
          trades += 1;
          if (tradePnL > 0) {
            wins += 1;
          } else {
            losses += 1;
          }
          position = null;
          entryPrice = 0;
        }
      }
    }

    const winRate = trades > 0 ? wins / trades : 0;
    return { profit, winRate, trades, wins, losses };
  }
}
