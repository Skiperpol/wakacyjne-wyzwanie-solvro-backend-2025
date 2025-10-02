import { Test, TestingModule } from '@nestjs/testing';
import { TradeService } from './trade.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { TradeStatus, TradeSide, TradeType } from '@prisma/client';

describe('TradeService', () => {
  let service: TradeService;
  let prismaService: PrismaService;

  const mockTrade = {
    id: '1',
    portfolioId: 'portfolio1',
    symbol: 'AAPL',
    side: TradeSide.BUY,
    type: TradeType.MARKET,
    quantity: 100.5,
    price: null,
    status: TradeStatus.NEW,
    createdAt: new Date(),
    filledAt: null,
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a trade successfully', async () => {
      const createTradeDto = {
        portfolioId: 'portfolio1',
        symbol: 'AAPL',
        side: TradeSide.BUY,
        type: TradeType.MARKET,
        quantity: 100.5,
      };

      mockPrismaService.trade.create.mockResolvedValue(mockTrade);

      const result = await service.create(createTradeDto);

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
        data: createTradeDto,
      });
    });
  });

  describe('fillTrade', () => {
    it('should fill a trade with price', async () => {
      const filledTrade = {
        ...mockTrade,
        status: TradeStatus.FILLED,
        price: 150.25,
        filledAt: new Date(),
      };
      mockPrismaService.trade.update.mockResolvedValue(filledTrade);

      const result = await service.fillTrade('1', 150.25);

      expect(result.status).toBe(TradeStatus.FILLED);
      expect(result.price).toBe(150.25);
      expect(result.filledAt).toBeDefined();
    });
  });
});
