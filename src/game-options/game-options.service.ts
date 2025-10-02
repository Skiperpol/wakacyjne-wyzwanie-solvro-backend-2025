import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateGameOptionsDto,
  UpdateGameOptionsDto,
  GameOptionsResponseDto,
} from './dto/game-options.dto';
import { GameOptions } from '@prisma/client';

@Injectable()
export class GameOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createGameOptionsDto: CreateGameOptionsDto,
  ): Promise<GameOptionsResponseDto> {
    try {
      const gameOptions = await this.prisma.gameOptions.create({
        data: createGameOptionsDto,
      });
      return this.mapToResponseDto(gameOptions);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Game options already exist for this user');
      }
      throw error;
    }
  }

  async findAll(): Promise<GameOptionsResponseDto[]> {
    const gameOptions = await this.prisma.gameOptions.findMany();
    return gameOptions.map((options) => this.mapToResponseDto(options));
  }

  async findByUserId(userId: string): Promise<GameOptionsResponseDto> {
    const gameOptions = await this.prisma.gameOptions.findUnique({
      where: { userId },
    });

    if (!gameOptions) {
      throw new NotFoundException(`Game options for user ${userId} not found`);
    }

    return this.mapToResponseDto(gameOptions);
  }

  async findOne(id: string): Promise<GameOptionsResponseDto> {
    const gameOptions = await this.prisma.gameOptions.findUnique({
      where: { id },
    });

    if (!gameOptions) {
      throw new NotFoundException(`Game options with ID ${id} not found`);
    }

    return this.mapToResponseDto(gameOptions);
  }

  async update(
    id: string,
    updateGameOptionsDto: UpdateGameOptionsDto,
  ): Promise<GameOptionsResponseDto> {
    try {
      const gameOptions = await this.prisma.gameOptions.update({
        where: { id },
        data: updateGameOptionsDto,
      });
      return this.mapToResponseDto(gameOptions);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Game options with ID ${id} not found`);
      }
      throw error;
    }
  }

  async updateByUserId(
    userId: string,
    updateGameOptionsDto: UpdateGameOptionsDto,
  ): Promise<GameOptionsResponseDto> {
    try {
      const gameOptions = await this.prisma.gameOptions.update({
        where: { userId },
        data: updateGameOptionsDto,
      });
      return this.mapToResponseDto(gameOptions);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Game options for user ${userId} not found`,
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.gameOptions.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Game options with ID ${id} not found`);
      }
      throw error;
    }
  }

  async removeByUserId(userId: string): Promise<void> {
    try {
      await this.prisma.gameOptions.delete({
        where: { userId },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Game options for user ${userId} not found`,
        );
      }
      throw error;
    }
  }

  async upsert(
    userId: string,
    updateGameOptionsDto: UpdateGameOptionsDto,
  ): Promise<GameOptionsResponseDto> {
    const gameOptions = await this.prisma.gameOptions.upsert({
      where: { userId },
      update: updateGameOptionsDto,
      create: {
        userId,
        startingBalance: updateGameOptionsDto.startingBalance ?? 10000,
        leverageMax: updateGameOptionsDto.leverageMax ?? 10,
        riskPerTradePct: updateGameOptionsDto.riskPerTradePct ?? 2.5,
        takeProfitPctDefault: updateGameOptionsDto.takeProfitPctDefault ?? 15,
        stopLossPctDefault: updateGameOptionsDto.stopLossPctDefault ?? 5,
        timeframeDefault: updateGameOptionsDto.timeframeDefault ?? '1h',
      },
    });
    return this.mapToResponseDto(gameOptions);
  }

  private mapToResponseDto(gameOptions: GameOptions): GameOptionsResponseDto {
    return {
      id: gameOptions.id,
      userId: gameOptions.userId,
      startingBalance: gameOptions.startingBalance,
      leverageMax: gameOptions.leverageMax,
      riskPerTradePct: gameOptions.riskPerTradePct,
      takeProfitPctDefault: gameOptions.takeProfitPctDefault,
      stopLossPctDefault: gameOptions.stopLossPctDefault,
      timeframeDefault: gameOptions.timeframeDefault,
      createdAt: gameOptions.createdAt,
      updatedAt: gameOptions.updatedAt,
    };
  }
}
