import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { SessionModule } from './session/session.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { PositionModule } from './position/position.module';
import { TradeModule } from './trade/trade.module';
import { WatchlistModule } from './watchlist/watchlist.module';
import { GameOptionsModule } from './game-options/game-options.module';
import { BacktestModule } from './backtest/backtest.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    SessionModule,
    PortfolioModule,
    PositionModule,
    TradeModule,
    WatchlistModule,
    GameOptionsModule,
    BacktestModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
