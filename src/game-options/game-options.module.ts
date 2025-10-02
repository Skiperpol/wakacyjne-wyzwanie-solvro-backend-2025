import { Module } from '@nestjs/common';
import { GameOptionsController } from './game-options.controller';
import { GameOptionsService } from './game-options.service';

@Module({
  controllers: [GameOptionsController],
  providers: [GameOptionsService],
  exports: [GameOptionsService],
})
export class GameOptionsModule {}
