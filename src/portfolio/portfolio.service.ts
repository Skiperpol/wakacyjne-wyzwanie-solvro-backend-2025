import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isPrismaErrorWithCode } from '../prisma/prisma-error.util';
import {
  CreatePortfolioDto,
  UpdatePortfolioDto,
  PortfolioResponseDto,
} from './dto/portfolio.dto';
import { Portfolio } from '@prisma/client';

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPortfolioDto: CreatePortfolioDto,
  ): Promise<PortfolioResponseDto> {
    const portfolio = await this.prisma.portfolio.create({
      data: createPortfolioDto,
    });
    return this.mapToResponseDto(portfolio);
  }

  async findAll(): Promise<PortfolioResponseDto[]> {
    const portfolios = await this.prisma.portfolio.findMany();
    return portfolios.map((portfolio) => this.mapToResponseDto(portfolio));
  }

  async findByUserId(userId: string): Promise<PortfolioResponseDto[]> {
    const portfolios = await this.prisma.portfolio.findMany({
      where: { userId },
    });
    return portfolios.map((portfolio) => this.mapToResponseDto(portfolio));
  }

  async findOne(id: string): Promise<PortfolioResponseDto> {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id },
    });

    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${id} not found`);
    }

    return this.mapToResponseDto(portfolio);
  }

  async update(
    id: string,
    updatePortfolioDto: UpdatePortfolioDto,
  ): Promise<PortfolioResponseDto> {
    try {
      const portfolio = await this.prisma.portfolio.update({
        where: { id },
        data: updatePortfolioDto,
      });
      return this.mapToResponseDto(portfolio);
    } catch (error) {
      if (isPrismaErrorWithCode(error) && error.code === 'P2025') {
        throw new NotFoundException(`Portfolio with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.portfolio.delete({
        where: { id },
      });
    } catch (error) {
      if (isPrismaErrorWithCode(error) && error.code === 'P2025') {
        throw new NotFoundException(`Portfolio with ID ${id} not found`);
      }
      throw error;
    }
  }

  async findByUserAndName(
    userId: string,
    name: string,
  ): Promise<PortfolioResponseDto | null> {
    const portfolio = await this.prisma.portfolio.findFirst({
      where: { userId, name },
    });

    return portfolio ? this.mapToResponseDto(portfolio) : null;
  }

  private mapToResponseDto(portfolio: Portfolio): PortfolioResponseDto {
    return {
      id: portfolio.id,
      userId: portfolio.userId,
      name: portfolio.name,
      baseCurrency: portfolio.baseCurrency,
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt,
    };
  }
}
