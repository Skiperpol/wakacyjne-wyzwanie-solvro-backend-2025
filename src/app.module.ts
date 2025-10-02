import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { SessionModule } from './session/session.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { PositionModule } from './position/position.module';
import { TradeModule } from './trade/trade.module';
import { WatchlistModule } from './watchlist/watchlist.module';
import { GameOptionsModule } from './game-options/game-options.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
