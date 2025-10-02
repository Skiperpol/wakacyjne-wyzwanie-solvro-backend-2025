import { Test, TestingModule } from '@nestjs/testing';
import { TradeService } from './trade.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateTradeDto, UpdateTradeDto } from './dto/trade.dto';
import { TradeStatus, TradeSide, TradeType } from '@prisma/client';

describe('TradeService', () => {
  let service: TradeService;
  let prismaService: PrismaService;

  const mockTrade = {
    id: 'clx1234567890',
    portfolioId: 'portfolio-1',
    symbol: 'AAPL',
    side: TradeSide.BUY,
    type: TradeType.MARKET,
    quantity: 100.5,
    price: null,
    status: TradeStatus.NEW,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    filledAt: null,
    rejectionReason: null,
  };

  const mockFilledTrade = {
    id: 'clx1234567891',
    portfolioId: 'portfolio-1',
    symbol: 'GOOGL',
    side: TradeSide.SELL,
    type: TradeType.LIMIT,
    quantity: 50.0,
    price: 150.25,
    status: TradeStatus.FILLED,
    createdAt: new Date('2024-01-01T10:00:00.000Z'),
    filledAt: new Date('2024-01-01T10:05:00.000Z'),
    rejectionReason: null,
  };

  const mockPrismaService = {
    trade: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TradeService>(TradeService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const validCreateTradeDto: CreateTradeDto = {
      portfolioId: 'portfolio-1',
      symbol: 'AAPL',
      side: TradeSide.BUY,
      type: TradeType.MARKET,
      quantity: 100.5,
    };

    it('should create a trade successfully with valid data', async () => {
      mockPrismaService.trade.create.mockResolvedValue(mockTrade);

      const result = await service.create(validCreateTradeDto);

      expect(result).toEqual({
        id: mockTrade.id,
        portfolioId: mockTrade.portfolioId,
        symbol: mockTrade.symbol,
        side: mockTrade.side,
        type: mockTrade.type,
        quantity: mockTrade.quantity,
        price: undefined,
        status: mockTrade.status,
        createdAt: mockTrade.createdAt,
        filledAt: undefined,
        rejectionReason: undefined,
      });
      expect(mockPrismaService.trade.create).toHaveBeenCalledWith({
        data: validCreateTradeDto,
      });
      expect(mockPrismaService.trade.create).toHaveBeenCalledTimes(1);
    });

    it('should create a trade with limit order and price', async () => {
      const limitOrderDto: CreateTradeDto = {
        portfolioId: 'portfolio-1',
        symbol: 'GOOGL',
        side: TradeSide.SELL,
        type: TradeType.LIMIT,
        quantity: 50.0,
        price: 150.25,
      };
      const limitOrderTrade = { ...mockFilledTrade, status: TradeStatus.NEW };
      mockPrismaService.trade.create.mockResolvedValue(limitOrderTrade);

      const result = await service.create(limitOrderDto);

      expect(result.price).toBe(150.25);
      expect(result.type).toBe(TradeType.LIMIT);
      expect(mockPrismaService.trade.create).toHaveBeenCalledWith({
        data: limitOrderDto,
      });
    });

    it('should handle database errors during creation', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaService.trade.create.mockRejectedValue(dbError);

      await expect(service.create(validCreateTradeDto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle very large quantities', async () => {
      const largeQuantityTrade = {
        ...mockTrade,
        quantity: 999999999.99,
      };
      mockPrismaService.trade.create.mockResolvedValue(largeQuantityTrade);

      const result = await service.create({
        ...validCreateTradeDto,
        quantity: 999999999.99,
      });

      expect(result.quantity).toBe(999999999.99);
    });

    it('should handle very small quantities', async () => {
      const smallQuantityTrade = {
        ...mockTrade,
        quantity: 0.000001,
      };
      mockPrismaService.trade.create.mockResolvedValue(smallQuantityTrade);

      const result = await service.create({
        ...validCreateTradeDto,
        quantity: 0.000001,
      });

      expect(result.quantity).toBe(0.000001);
    });
  });

  describe('findAll', () => {
    it('should return all trades when trades exist', async () => {
      const trades = [mockTrade, mockFilledTrade];
      mockPrismaService.trade.findMany.mockResolvedValue(trades);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe(TradeStatus.NEW);
      expect(result[1].status).toBe(TradeStatus.FILLED);
      expect(mockPrismaService.trade.findMany).toHaveBeenCalledWith();
    });

    it('should return empty array when no trades exist', async () => {
      mockPrismaService.trade.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle database errors during findAll', async () => {
      const dbError = new Error('Database timeout');
      mockPrismaService.trade.findMany.mockRejectedValue(dbError);

      await expect(service.findAll()).rejects.toThrow('Database timeout');
    });
  });

  describe('findByPortfolioId', () => {
    it('should return trades for specific portfolio', async () => {
      const portfolioTrades = [mockTrade, mockFilledTrade];
      mockPrismaService.trade.findMany.mockResolvedValue(portfolioTrades);

      const result = await service.findByPortfolioId('portfolio-1');

      expect(result).toHaveLength(2);
      expect(result.every(trade => trade.portfolioId === 'portfolio-1')).toBe(true);
      expect(mockPrismaService.trade.findMany).toHaveBeenCalledWith({
        where: { portfolioId: 'portfolio-1' },
      });
    });

    it('should return empty array for non-existent portfolio', async () => {
      mockPrismaService.trade.findMany.mockResolvedValue([]);

      const result = await service.findByPortfolioId('non-existent-portfolio');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle invalid portfolio ID format', async () => {
      mockPrismaService.trade.findMany.mockResolvedValue([]);

      const result = await service.findByPortfolioId('');

      expect(result).toEqual([]);
      expect(mockPrismaService.trade.findMany).toHaveBeenCalledWith({
        where: { portfolioId: '' },
      });
    });
  });

  describe('findByStatus', () => {
    it('should return trades with NEW status', async () => {
      const newTrades = [mockTrade];
      mockPrismaService.trade.findMany.mockResolvedValue(newTrades);

      const result = await service.findByStatus(TradeStatus.NEW);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(TradeStatus.NEW);
      expect(mockPrismaService.trade.findMany).toHaveBeenCalledWith({
        where: { status: TradeStatus.NEW },
      });
    });

    it('should return trades with FILLED status', async () => {
      const filledTrades = [mockFilledTrade];
      mockPrismaService.trade.findMany.mockResolvedValue(filledTrades);

      const result = await service.findByStatus(TradeStatus.FILLED);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(TradeStatus.FILLED);
      expect(mockPrismaService.trade.findMany).toHaveBeenCalledWith({
        where: { status: TradeStatus.FILLED },
      });
    });

    it('should return empty array for non-existent status', async () => {
      mockPrismaService.trade.findMany.mockResolvedValue([]);

      const result = await service.findByStatus(TradeStatus.CANCELLED);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findPendingTrades', () => {
    it('should return only NEW trades for portfolio', async () => {
      const pendingTrades = [mockTrade];
      mockPrismaService.trade.findMany.mockResolvedValue(pendingTrades);

      const result = await service.findPendingTrades('portfolio-1');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(TradeStatus.NEW);
      expect(result[0].portfolioId).toBe('portfolio-1');
      expect(mockPrismaService.trade.findMany).toHaveBeenCalledWith({
        where: {
          portfolioId: 'portfolio-1',
          status: { in: [TradeStatus.NEW] },
        },
      });
    });

    it('should return empty array when no pending trades exist', async () => {
      mockPrismaService.trade.findMany.mockResolvedValue([]);

      const result = await service.findPendingTrades('portfolio-1');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a trade when found with valid ID', async () => {
      mockPrismaService.trade.findUnique.mockResolvedValue(mockTrade);

      const result = await service.findOne(mockTrade.id);

      expect(result).toEqual({
        id: mockTrade.id,
        portfolioId: mockTrade.portfolioId,
        symbol: mockTrade.symbol,
        side: mockTrade.side,
        type: mockTrade.type,
        quantity: mockTrade.quantity,
        price: undefined,
        status: mockTrade.status,
        createdAt: mockTrade.createdAt,
        filledAt: undefined,
        rejectionReason: undefined,
      });
      expect(mockPrismaService.trade.findUnique).toHaveBeenCalledWith({
        where: { id: mockTrade.id },
      });
    });

    it('should throw NotFoundException when trade not found', async () => {
      const nonExistentId = 'non-existent-id';
      mockPrismaService.trade.findUnique.mockResolvedValue(null);

      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        `Trade with ID ${nonExistentId} not found`,
      );
    });

    it('should handle empty string ID', async () => {
      mockPrismaService.trade.findUnique.mockResolvedValue(null);

      await expect(service.findOne('')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('')).rejects.toThrow(
        'Trade with ID  not found',
      );
    });
  });

  describe('update', () => {
    const updateTradeDto: UpdateTradeDto = {
      quantity: 150.0,
      price: 200.0,
    };

    it('should update a trade successfully with valid data', async () => {
      const updatedTrade = { ...mockTrade, ...updateTradeDto };
      mockPrismaService.trade.update.mockResolvedValue(updatedTrade);

      const result = await service.update(mockTrade.id, updateTradeDto);

      expect(result.quantity).toBe(updateTradeDto.quantity);
      expect(result.price).toBe(updateTradeDto.price);
      expect(mockPrismaService.trade.update).toHaveBeenCalledWith({
        where: { id: mockTrade.id },
        data: updateTradeDto,
      });
    });

    it('should update only quantity when only quantity provided', async () => {
      const partialUpdate = { quantity: 75.0 };
      const updatedTrade = { ...mockTrade, ...partialUpdate };
      mockPrismaService.trade.update.mockResolvedValue(updatedTrade);

      const result = await service.update(mockTrade.id, partialUpdate);

      expect(result.quantity).toBe(partialUpdate.quantity);
      expect(result.price).toBe(undefined); // Should remain unchanged
      expect(mockPrismaService.trade.update).toHaveBeenCalledWith({
        where: { id: mockTrade.id },
        data: partialUpdate,
      });
    });

    it('should throw NotFoundException when trade not found for update', async () => {
      const nonExistentId = 'non-existent-id';
      mockPrismaService.trade.update.mockRejectedValue({ code: 'P2025' });

      await expect(service.update(nonExistentId, updateTradeDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(nonExistentId, updateTradeDto)).rejects.toThrow(
        `Trade with ID ${nonExistentId} not found`,
      );
    });

    it('should re-throw other Prisma errors during update', async () => {
      const otherError = new Error('Database constraint violation');
      mockPrismaService.trade.update.mockRejectedValue(otherError);

      await expect(service.update(mockTrade.id, updateTradeDto)).rejects.toThrow(
        'Database constraint violation',
      );
    });
  });

  describe('fillTrade', () => {
    it('should fill a trade with price and timestamp', async () => {
      const filledTrade = {
        ...mockTrade,
        status: TradeStatus.FILLED,
        price: 150.25,
        filledAt: new Date('2024-01-01T10:05:00.000Z'),
      };
      mockPrismaService.trade.update.mockResolvedValue(filledTrade);

      const result = await service.fillTrade(mockTrade.id, 150.25);

      expect(result.status).toBe(TradeStatus.FILLED);
      expect(result.price).toBe(150.25);
      expect(result.filledAt).toEqual(new Date('2024-01-01T10:05:00.000Z'));
      expect(mockPrismaService.trade.update).toHaveBeenCalledWith({
        where: { id: mockTrade.id },
        data: {
          status: TradeStatus.FILLED,
          price: 150.25,
          filledAt: expect.any(Date),
        },
      });
    });

    it('should handle zero price fills', async () => {
      const filledTrade = {
        ...mockTrade,
        status: TradeStatus.FILLED,
        price: 0,
        filledAt: new Date(),
      };
      mockPrismaService.trade.update.mockResolvedValue(filledTrade);

      const result = await service.fillTrade(mockTrade.id, 0);

      expect(result.price).toBe(0);
      expect(result.status).toBe(TradeStatus.FILLED);
    });

    it('should handle negative price fills', async () => {
      const filledTrade = {
        ...mockTrade,
        status: TradeStatus.FILLED,
        price: -10.0,
        filledAt: new Date(),
      };
      mockPrismaService.trade.update.mockResolvedValue(filledTrade);

      const result = await service.fillTrade(mockTrade.id, -10.0);

      expect(result.price).toBe(-10.0);
      expect(result.status).toBe(TradeStatus.FILLED);
    });

    it('should throw NotFoundException when trade not found for fill', async () => {
      const nonExistentId = 'non-existent-id';
      mockPrismaService.trade.update.mockRejectedValue({ code: 'P2025' });

      await expect(service.fillTrade(nonExistentId, 150.25)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.fillTrade(nonExistentId, 150.25)).rejects.toThrow(
        `Trade with ID ${nonExistentId} not found`,
      );
    });
  });

  describe('rejectTrade', () => {
    it('should reject a trade with reason', async () => {
      const rejectedTrade = {
        ...mockTrade,
        status: TradeStatus.REJECTED,
        rejectionReason: 'Insufficient funds',
      };
      mockPrismaService.trade.update.mockResolvedValue(rejectedTrade);

      const result = await service.rejectTrade(mockTrade.id, 'Insufficient funds');

      expect(result.status).toBe(TradeStatus.REJECTED);
      expect(result.rejectionReason).toBe('Insufficient funds');
      expect(mockPrismaService.trade.update).toHaveBeenCalledWith({
        where: { id: mockTrade.id },
        data: {
          status: TradeStatus.REJECTED,
          rejectionReason: 'Insufficient funds',
        },
      });
    });

    it('should handle empty rejection reason', async () => {
      const rejectedTrade = {
        ...mockTrade,
        status: TradeStatus.REJECTED,
        rejectionReason: '',
      };
      mockPrismaService.trade.update.mockResolvedValue(rejectedTrade);

      const result = await service.rejectTrade(mockTrade.id, '');

      expect(result.status).toBe(TradeStatus.REJECTED);
      expect(result.rejectionReason).toBe('');
    });

    it('should throw NotFoundException when trade not found for rejection', async () => {
      const nonExistentId = 'non-existent-id';
      mockPrismaService.trade.update.mockRejectedValue({ code: 'P2025' });

      await expect(service.rejectTrade(nonExistentId, 'Test reason')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.rejectTrade(nonExistentId, 'Test reason')).rejects.toThrow(
        `Trade with ID ${nonExistentId} not found`,
      );
    });
  });

  describe('remove', () => {
    it('should delete a trade successfully', async () => {
      mockPrismaService.trade.delete.mockResolvedValue(mockTrade);

      await service.remove(mockTrade.id);

      expect(mockPrismaService.trade.delete).toHaveBeenCalledWith({
        where: { id: mockTrade.id },
      });
      expect(mockPrismaService.trade.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when trade not found for deletion', async () => {
      const nonExistentId = 'non-existent-id';
      mockPrismaService.trade.delete.mockRejectedValue({ code: 'P2025' });

      await expect(service.remove(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove(nonExistentId)).rejects.toThrow(
        `Trade with ID ${nonExistentId} not found`,
      );
    });

    it('should re-throw other Prisma errors during deletion', async () => {
      const otherError = new Error('Foreign key constraint violation');
      mockPrismaService.trade.delete.mockRejectedValue(otherError);

      await expect(service.remove(mockTrade.id)).rejects.toThrow(
        'Foreign key constraint violation',
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete trade lifecycle', async () => {
      // Create
      mockPrismaService.trade.create.mockResolvedValue(mockTrade);
      const createdTrade = await service.create({
        portfolioId: mockTrade.portfolioId,
        symbol: mockTrade.symbol,
        side: mockTrade.side,
        type: mockTrade.type,
        quantity: mockTrade.quantity,
      });

      // Find
      mockPrismaService.trade.findUnique.mockResolvedValue(mockTrade);
      const foundTrade = await service.findOne(createdTrade.id);

      // Fill
      const filledTrade = { ...mockTrade, status: TradeStatus.FILLED, price: 150.25, filledAt: new Date() };
      mockPrismaService.trade.update.mockResolvedValue(filledTrade);
      const updatedTrade = await service.fillTrade(foundTrade.id, 150.25);

      // Delete
      mockPrismaService.trade.delete.mockResolvedValue(filledTrade);
      await service.remove(updatedTrade.id);

      expect(createdTrade.id).toBe(foundTrade.id);
      expect(updatedTrade.status).toBe(TradeStatus.FILLED);
      expect(updatedTrade.price).toBe(150.25);
      expect(mockPrismaService.trade.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.trade.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.trade.update).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.trade.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent operations on same portfolio', async () => {
      mockPrismaService.trade.create
        .mockResolvedValueOnce(mockTrade)
        .mockResolvedValueOnce(mockFilledTrade);
      mockPrismaService.trade.findMany.mockResolvedValue([mockTrade, mockFilledTrade]);

      // Simulate concurrent operations
      const [createdTrade1, createdTrade2, allTrades] = await Promise.all([
        service.create({
          portfolioId: 'portfolio-1',
          symbol: 'AAPL',
          side: TradeSide.BUY,
          type: TradeType.MARKET,
          quantity: 100,
        }),
        service.create({
          portfolioId: 'portfolio-1',
          symbol: 'GOOGL',
          side: TradeSide.SELL,
          type: TradeType.LIMIT,
          quantity: 50,
          price: 150.25,
        }),
        service.findByPortfolioId('portfolio-1'),
      ]);

      expect(createdTrade1).toBeDefined();
      expect(createdTrade2).toBeDefined();
      expect(allTrades).toHaveLength(2);
      expect(allTrades.every(trade => trade.portfolioId === 'portfolio-1')).toBe(true);
    });

    it('should handle trade rejection workflow', async () => {
      // Create
      mockPrismaService.trade.create.mockResolvedValue(mockTrade);
      const createdTrade = await service.create({
        portfolioId: mockTrade.portfolioId,
        symbol: mockTrade.symbol,
        side: mockTrade.side,
        type: mockTrade.type,
        quantity: mockTrade.quantity,
      });

      // Reject
      const rejectedTrade = { ...mockTrade, status: TradeStatus.REJECTED, rejectionReason: 'Invalid symbol' };
      mockPrismaService.trade.update.mockResolvedValue(rejectedTrade);
      const updatedTrade = await service.rejectTrade(createdTrade.id, 'Invalid symbol');

      expect(updatedTrade.status).toBe(TradeStatus.REJECTED);
      expect(updatedTrade.rejectionReason).toBe('Invalid symbol');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle special characters in symbols', async () => {
      const specialSymbolTrade = {
        ...mockTrade,
        symbol: 'BTC-USD',
      };
      mockPrismaService.trade.create.mockResolvedValue(specialSymbolTrade);

      const result = await service.create({
        portfolioId: mockTrade.portfolioId,
        symbol: 'BTC-USD',
        side: mockTrade.side,
        type: mockTrade.type,
        quantity: mockTrade.quantity,
      });

      expect(result.symbol).toBe('BTC-USD');
    });

    it('should handle database connection failures gracefully', async () => {
      const connectionError = new Error('Connection timeout');
      mockPrismaService.trade.findMany.mockRejectedValue(connectionError);

      await expect(service.findAll()).rejects.toThrow('Connection timeout');
    });

    it('should handle foreign key constraint violations', async () => {
      const fkError = new Error('Foreign key constraint failed');
      mockPrismaService.trade.create.mockRejectedValue(fkError);

      await expect(service.create({
        portfolioId: 'invalid-portfolio',
        symbol: 'AAPL',
        side: TradeSide.BUY,
        type: TradeType.MARKET,
        quantity: 100,
      })).rejects.toThrow('Foreign key constraint failed');
    });
  });
});