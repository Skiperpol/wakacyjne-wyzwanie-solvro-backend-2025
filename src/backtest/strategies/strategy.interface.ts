export interface IStrategy<Candle = any> {
  generateSignal(candle: Candle): 'BUY' | 'SELL' | 'HOLD';
}
