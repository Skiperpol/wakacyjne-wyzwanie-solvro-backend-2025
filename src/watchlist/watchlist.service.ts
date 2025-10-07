import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isPrismaErrorWithCode } from '../prisma/prisma-error.util';
import {
  CreateWatchlistDto,
  UpdateWatchlistDto,
  WatchlistResponseDto,
  CreateWatchlistItemDto,
  UpdateWatchlistItemDto,
  WatchlistItemResponseDto,
} from './dto/watchlist.dto';
import { Watchlist, WatchlistItem } from '@prisma/client';

@Injectable()
export class WatchlistService {
  constructor(private prisma: PrismaService) {}

  // Watchlist CRUD operations
  async createWatchlist(
    createWatchlistDto: CreateWatchlistDto,
  ): Promise<WatchlistResponseDto> {
    const watchlist = await this.prisma.watchlist.create({
      data: createWatchlistDto,
    });
    return this.mapToWatchlistResponseDto(watchlist);
  }

  async findAllWatchlists(): Promise<WatchlistResponseDto[]> {
    const watchlists = await this.prisma.watchlist.findMany();
    return watchlists.map((watchlist) =>
      this.mapToWatchlistResponseDto(watchlist),
    );
  }

  async findWatchlistsByUserId(
    userId: string,
  ): Promise<WatchlistResponseDto[]> {
    const watchlists = await this.prisma.watchlist.findMany({
      where: { userId },
    });
    return watchlists.map((watchlist) =>
      this.mapToWatchlistResponseDto(watchlist),
    );
  }

  async findWatchlistById(id: string): Promise<WatchlistResponseDto> {
    const watchlist = await this.prisma.watchlist.findUnique({
      where: { id },
    });

    if (!watchlist) {
      throw new NotFoundException(`Watchlist with ID ${id} not found`);
    }

    return this.mapToWatchlistResponseDto(watchlist);
  }

  async updateWatchlist(
    id: string,
    updateWatchlistDto: UpdateWatchlistDto,
  ): Promise<WatchlistResponseDto> {
    try {
      const watchlist = await this.prisma.watchlist.update({
        where: { id },
        data: updateWatchlistDto,
      });
      return this.mapToWatchlistResponseDto(watchlist);
    } catch (error) {
      if (isPrismaErrorWithCode(error) && error.code === 'P2025') {
        throw new NotFoundException(`Watchlist with ID ${id} not found`);
      }
      throw error;
    }
  }

  async removeWatchlist(id: string): Promise<void> {
    try {
      await this.prisma.watchlist.delete({
        where: { id },
      });
    } catch (error) {
      if (isPrismaErrorWithCode(error) && error.code === 'P2025') {
        throw new NotFoundException(`Watchlist with ID ${id} not found`);
      }
      throw error;
    }
  }

  // WatchlistItem CRUD operations
  async createWatchlistItem(
    createWatchlistItemDto: CreateWatchlistItemDto,
  ): Promise<WatchlistItemResponseDto> {
    const watchlistItem = await this.prisma.watchlistItem.create({
      data: createWatchlistItemDto,
    });
    return this.mapToWatchlistItemResponseDto(watchlistItem);
  }

  async findAllWatchlistItems(): Promise<WatchlistItemResponseDto[]> {
    const watchlistItems = await this.prisma.watchlistItem.findMany();
    return watchlistItems.map((item) =>
      this.mapToWatchlistItemResponseDto(item),
    );
  }

  async findWatchlistItemsByWatchlistId(
    watchlistId: string,
  ): Promise<WatchlistItemResponseDto[]> {
    const watchlistItems = await this.prisma.watchlistItem.findMany({
      where: { watchlistId },
      orderBy: { position: 'asc' },
    });
    return watchlistItems.map((item) =>
      this.mapToWatchlistItemResponseDto(item),
    );
  }

  async findWatchlistItemById(id: string): Promise<WatchlistItemResponseDto> {
    const watchlistItem = await this.prisma.watchlistItem.findUnique({
      where: { id },
    });

    if (!watchlistItem) {
      throw new NotFoundException(`Watchlist item with ID ${id} not found`);
    }

    return this.mapToWatchlistItemResponseDto(watchlistItem);
  }

  async updateWatchlistItem(
    id: string,
    updateWatchlistItemDto: UpdateWatchlistItemDto,
  ): Promise<WatchlistItemResponseDto> {
    try {
      const watchlistItem = await this.prisma.watchlistItem.update({
        where: { id },
        data: updateWatchlistItemDto,
      });
      return this.mapToWatchlistItemResponseDto(watchlistItem);
    } catch (error) {
      if (isPrismaErrorWithCode(error) && error.code === 'P2025') {
        throw new NotFoundException(`Watchlist item with ID ${id} not found`);
      }
      throw error;
    }
  }

  async removeWatchlistItem(id: string): Promise<void> {
    try {
      await this.prisma.watchlistItem.delete({
        where: { id },
      });
    } catch (error) {
      if (isPrismaErrorWithCode(error) && error.code === 'P2025') {
        throw new NotFoundException(`Watchlist item with ID ${id} not found`);
      }
      throw error;
    }
  }

  async removeAllWatchlistItems(watchlistId: string): Promise<void> {
    await this.prisma.watchlistItem.deleteMany({
      where: { watchlistId },
    });
  }

  private mapToWatchlistResponseDto(
    watchlist: Watchlist,
  ): WatchlistResponseDto {
    return {
      id: watchlist.id,
      userId: watchlist.userId,
      name: watchlist.name,
      createdAt: watchlist.createdAt,
    };
  }

  private mapToWatchlistItemResponseDto(
    watchlistItem: WatchlistItem,
  ): WatchlistItemResponseDto {
    return {
      id: watchlistItem.id,
      watchlistId: watchlistItem.watchlistId,
      symbol: watchlistItem.symbol,
      note: watchlistItem.note ?? undefined,
      position: watchlistItem.position ?? undefined,
    };
  }
}
