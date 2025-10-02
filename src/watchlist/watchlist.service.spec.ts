import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistService } from './watchlist.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('WatchlistService', () => {
  let service: WatchlistService;
  let prismaService: PrismaService;

  const mockWatchlist = {
    id: '1',
    userId: 'user1',
    name: 'Tech Stocks',
    createdAt: new Date(),
  };

  const mockWatchlistItem = {
    id: '1',
    watchlistId: 'watchlist1',
    symbol: 'AAPL',
    note: 'Apple Inc.',
    position: 1,
  };

  const mockPrismaService = {
    watchlist: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    watchlistItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WatchlistService>(WatchlistService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWatchlist', () => {
    it('should create a watchlist successfully', async () => {
      const createWatchlistDto = {
        userId: 'user1',
        name: 'Tech Stocks',
      };

      mockPrismaService.watchlist.create.mockResolvedValue(mockWatchlist);

      const result = await service.createWatchlist(createWatchlistDto);

      expect(result).toEqual({
        id: mockWatchlist.id,
        userId: mockWatchlist.userId,
        name: mockWatchlist.name,
        createdAt: mockWatchlist.createdAt,
      });
      expect(mockPrismaService.watchlist.create).toHaveBeenCalledWith({
        data: createWatchlistDto,
      });
    });
  });

  describe('createWatchlistItem', () => {
    it('should create a watchlist item successfully', async () => {
      const createWatchlistItemDto = {
        watchlistId: 'watchlist1',
        symbol: 'AAPL',
        note: 'Apple Inc.',
        position: 1,
      };

      mockPrismaService.watchlistItem.create.mockResolvedValue(
        mockWatchlistItem,
      );

      const result = await service.createWatchlistItem(createWatchlistItemDto);

      expect(result).toEqual({
        id: mockWatchlistItem.id,
        watchlistId: mockWatchlistItem.watchlistId,
        symbol: mockWatchlistItem.symbol,
        note: mockWatchlistItem.note,
        position: mockWatchlistItem.position,
      });
    });
  });
});
