import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';

describe('WatchlistController', () => {
  let controller: WatchlistController;

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

  const mockWatchlistService = {
    createWatchlist: jest.fn(),
    findAllWatchlists: jest.fn(),
    findWatchlistsByUserId: jest.fn(),
    findWatchlistById: jest.fn(),
    updateWatchlist: jest.fn(),
    removeWatchlist: jest.fn(),
    createWatchlistItem: jest.fn(),
    findAllWatchlistItems: jest.fn(),
    findWatchlistItemsByWatchlistId: jest.fn(),
    findWatchlistItemById: jest.fn(),
    updateWatchlistItem: jest.fn(),
    removeWatchlistItem: jest.fn(),
    removeAllWatchlistItems: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchlistController],
      providers: [
        {
          provide: WatchlistService,
          useValue: mockWatchlistService,
        },
      ],
    }).compile();

    controller = module.get<WatchlistController>(WatchlistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createWatchlist', () => {
    it('should create a watchlist', async () => {
      const createWatchlistDto = {
        userId: 'user1',
        name: 'Tech Stocks',
      };

      mockWatchlistService.createWatchlist.mockResolvedValue(mockWatchlist);

      const result = await controller.createWatchlist(createWatchlistDto);

      expect(result).toEqual(mockWatchlist);
      expect(mockWatchlistService.createWatchlist).toHaveBeenCalledWith(
        createWatchlistDto,
      );
    });
  });

  describe('createWatchlistItem', () => {
    it('should create a watchlist item', async () => {
      const createWatchlistItemDto = {
        watchlistId: 'watchlist1',
        symbol: 'AAPL',
        note: 'Apple Inc.',
        position: 1,
      };

      mockWatchlistService.createWatchlistItem.mockResolvedValue(
        mockWatchlistItem,
      );

      const result = await controller.createWatchlistItem(
        createWatchlistItemDto,
      );

      expect(result).toEqual(mockWatchlistItem);
      expect(mockWatchlistService.createWatchlistItem).toHaveBeenCalledWith(
        createWatchlistItemDto,
      );
    });
  });
});
