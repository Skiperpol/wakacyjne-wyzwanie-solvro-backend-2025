import { Test, TestingModule } from '@nestjs/testing';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { TradeStatus, TradeSide, TradeType } from '@prisma/client';

describe('TradeController', () => {
  let controller: TradeController;
  let tradeService: TradeService;

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

  const mockTradeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPortfolioId: jest.fn(),
    findByStatus: jest.fn(),
    findPendingTrades: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    fillTrade: jest.fn(),
    cancelTrade: jest.fn(),
    rejectTrade: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TradeController],
      providers: [
        {
          provide: TradeService,
          useValue: mockTradeService,
        },
      ],
    }).compile();

    controller = module.get<TradeController>(TradeController);
    tradeService = module.get<TradeService>(TradeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a trade', async () => {
      const createTradeDto = {
        portfolioId: 'portfolio1',
        symbol: 'AAPL',
        side: TradeSide.BUY,
        type: TradeType.MARKET,
        quantity: 100.5,
      };

      mockTradeService.create.mockResolvedValue(mockTrade);

      const result = await controller.create(createTradeDto);

      expect(result).toEqual(mockTrade);
      expect(tradeService.create).toHaveBeenCalledWith(createTradeDto);
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
      mockTradeService.fillTrade.mockResolvedValue(filledTrade);

      const result = await controller.fillTrade('1', 150.25);

      expect(result).toEqual(filledTrade);
      expect(tradeService.fillTrade).toHaveBeenCalledWith('1', 150.25);
    });
  });
});
