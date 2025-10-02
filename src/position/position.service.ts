import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePositionDto,
  UpdatePositionDto,
  PositionResponseDto,
} from './dto/position.dto';
import { Position } from '@prisma/client';

@Injectable()
export class PositionService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPositionDto: CreatePositionDto,
  ): Promise<PositionResponseDto> {
    const position = await this.prisma.position.create({
      data: createPositionDto,
    });
    return this.mapToResponseDto(position);
  }

  async findAll(): Promise<PositionResponseDto[]> {
    const positions = await this.prisma.position.findMany();
    return positions.map((position) => this.mapToResponseDto(position));
  }

  async findByPortfolioId(portfolioId: string): Promise<PositionResponseDto[]> {
    const positions = await this.prisma.position.findMany({
      where: { portfolioId },
    });
    return positions.map((position) => this.mapToResponseDto(position));
  }

  async findActivePositions(
    portfolioId: string,
  ): Promise<PositionResponseDto[]> {
    const positions = await this.prisma.position.findMany({
      where: {
        portfolioId,
        closedAt: null,
      },
    });
    return positions.map((position) => this.mapToResponseDto(position));
  }

  async findClosedPositions(
    portfolioId: string,
  ): Promise<PositionResponseDto[]> {
    const positions = await this.prisma.position.findMany({
      where: {
        portfolioId,
        closedAt: { not: null },
      },
    });
    return positions.map((position) => this.mapToResponseDto(position));
  }

  async findOne(id: string): Promise<PositionResponseDto> {
    const position = await this.prisma.position.findUnique({
      where: { id },
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    return this.mapToResponseDto(position);
  }

  async update(
    id: string,
    updatePositionDto: UpdatePositionDto,
  ): Promise<PositionResponseDto> {
    try {
      const position = await this.prisma.position.update({
        where: { id },
        data: updatePositionDto,
      });
      return this.mapToResponseDto(position);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Position with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.position.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Position with ID ${id} not found`);
      }
      throw error;
    }
  }

  async closePosition(
    id: string,
    pnlRealized: number,
  ): Promise<PositionResponseDto> {
    try {
      const position = await this.prisma.position.update({
        where: { id },
        data: {
          closedAt: new Date(),
          pnlRealized,
        },
      });
      return this.mapToResponseDto(position);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Position with ID ${id} not found`);
      }
      throw error;
    }
  }

  private mapToResponseDto(position: Position): PositionResponseDto {
    return {
      id: position.id,
      portfolioId: position.portfolioId,
      symbol: position.symbol,
      quantity: position.quantity,
      avgPrice: position.avgPrice,
      openedAt: position.openedAt,
      closedAt: position.closedAt ?? undefined,
      pnlRealized: position.pnlRealized,
    };
  }
}
