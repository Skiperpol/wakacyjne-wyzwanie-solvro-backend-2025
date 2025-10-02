import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTradeDto,
  UpdateTradeDto,
  TradeResponseDto,
} from './dto/trade.dto';
import { Trade, TradeStatus } from '@prisma/client';

@Injectable()
export class TradeService {
  constructor(private prisma: PrismaService) {}

  async create(createTradeDto: CreateTradeDto): Promise<TradeResponseDto> {
    const trade = await this.prisma.trade.create({
      data: createTradeDto,
    });
    return this.mapToResponseDto(trade);
  }

  async findAll(): Promise<TradeResponseDto[]> {
    const trades = await this.prisma.trade.findMany();
    return trades.map((trade) => this.mapToResponseDto(trade));
  }

  async findByPortfolioId(portfolioId: string): Promise<TradeResponseDto[]> {
    const trades = await this.prisma.trade.findMany({
      where: { portfolioId },
    });
    return trades.map((trade) => this.mapToResponseDto(trade));
  }

  async findByStatus(status: TradeStatus): Promise<TradeResponseDto[]> {
    const trades = await this.prisma.trade.findMany({
      where: { status },
    });
    return trades.map((trade) => this.mapToResponseDto(trade));
  }

  async findPendingTrades(portfolioId: string): Promise<TradeResponseDto[]> {
    const trades = await this.prisma.trade.findMany({
      where: {
        portfolioId,
        status: { in: [TradeStatus.NEW] },
      },
    });
    return trades.map((trade) => this.mapToResponseDto(trade));
  }

  async findOne(id: string): Promise<TradeResponseDto> {
    const trade = await this.prisma.trade.findUnique({
      where: { id },
    });

    if (!trade) {
      throw new NotFoundException(`Trade with ID ${id} not found`);
    }

    return this.mapToResponseDto(trade);
  }

  async update(
    id: string,
    updateTradeDto: UpdateTradeDto,
  ): Promise<TradeResponseDto> {
    try {
      const trade = await this.prisma.trade.update({
        where: { id },
        data: updateTradeDto,
      });
      return this.mapToResponseDto(trade);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Trade with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.trade.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Trade with ID ${id} not found`);
      }
      throw error;
    }
  }

  async fillTrade(id: string, price: number): Promise<TradeResponseDto> {
    try {
      const trade = await this.prisma.trade.update({
        where: { id },
        data: {
          status: TradeStatus.FILLED,
          price,
          filledAt: new Date(),
        },
      });
      return this.mapToResponseDto(trade);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Trade with ID ${id} not found`);
      }
      throw error;
    }
  }

  async cancelTrade(id: string): Promise<TradeResponseDto> {
    try {
      const trade = await this.prisma.trade.update({
        where: { id },
        data: {
          status: TradeStatus.CANCELLED,
        },
      });
      return this.mapToResponseDto(trade);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Trade with ID ${id} not found`);
      }
      throw error;
    }
  }

  async rejectTrade(
    id: string,
    rejectionReason: string,
  ): Promise<TradeResponseDto> {
    try {
      const trade = await this.prisma.trade.update({
        where: { id },
        data: {
          status: TradeStatus.REJECTED,
          rejectionReason,
        },
      });
      return this.mapToResponseDto(trade);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Trade with ID ${id} not found`);
      }
      throw error;
    }
  }

  private mapToResponseDto(trade: Trade): TradeResponseDto {
    return {
      id: trade.id,
      portfolioId: trade.portfolioId,
      symbol: trade.symbol,
      side: trade.side,
      type: trade.type,
      quantity: trade.quantity,
      price: trade.price ?? undefined,
      status: trade.status,
      createdAt: trade.createdAt,
      filledAt: trade.filledAt ?? undefined,
      rejectionReason: trade.rejectionReason ?? undefined,
    };
  }
}
