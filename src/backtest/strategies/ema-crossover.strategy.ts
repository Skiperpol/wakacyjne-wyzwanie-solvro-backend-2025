import { EMA } from 'technicalindicators';
import { IStrategy } from './strategy.interface';

type Candle = { close: number };

export class EmaCrossoverStrategy implements IStrategy<Candle> {
  private short: EMA;
  private long: EMA;
  private prevShort?: number;
  private prevLong?: number;

  constructor(params: { shortEma: number; longEma: number }) {
    if (params.shortEma >= params.longEma) {
      throw new Error('shortEma must be less than longEma');
    }
    this.short = new EMA({ period: params.shortEma, values: [] });
    this.long = new EMA({ period: params.longEma, values: [] });
  }

  generateSignal(candle: Candle): 'BUY' | 'SELL' | 'HOLD' {
    const shortTrade = this.short.nextValue(candle.close);
    const longTrade = this.long.nextValue(candle.close);

    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    if (
      shortTrade !== undefined &&
      longTrade !== undefined &&
      this.prevShort !== undefined &&
      this.prevLong !== undefined
    ) {
      const crossedUp =
        this.prevShort <= this.prevLong && shortTrade > longTrade;
      const crossedDown =
        this.prevShort >= this.prevLong && shortTrade < longTrade;
      if (crossedUp) signal = 'BUY';
      else if (crossedDown) signal = 'SELL';
    }

    this.prevShort = shortTrade;
    this.prevLong = longTrade;
    return signal;
  }
}
