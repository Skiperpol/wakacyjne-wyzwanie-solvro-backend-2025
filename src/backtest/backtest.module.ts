import { Module } from '@nestjs/common';
import { BacktestController } from './backtest.controller';
import { BacktestService } from './backtest.service';
import { BacktestEngineService } from './engine/backtest-engine.service';

@Module({
  controllers: [BacktestController],
  providers: [BacktestService, BacktestEngineService],
})
export class BacktestModule {}
