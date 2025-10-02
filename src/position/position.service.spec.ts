import { Test, TestingModule } from '@nestjs/testing';
import { PositionService } from './position.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PositionService', () => {
  let service: PositionService;
  let prismaService: PrismaService;

  const mockPosition = {
    id: '1',
    portfolioId: 'portfolio1',
    symbol: 'AAPL',
    quantity: 100.5,
    avgPrice: 150.25,
    openedAt: new Date(),
    closedAt: null,
    pnlRealized: 0,
  };

  const mockPrismaService = {
    position: {
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
        PositionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PositionService>(PositionService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a position successfully', async () => {
      const createPositionDto = {
        portfolioId: 'portfolio1',
        symbol: 'AAPL',
        quantity: 100.5,
        avgPrice: 150.25,
        openedAt: new Date(),
      };

      mockPrismaService.position.create.mockResolvedValue(mockPosition);

      const result = await service.create(createPositionDto);

      expect(result).toEqual({
        id: mockPosition.id,
        portfolioId: mockPosition.portfolioId,
        symbol: mockPosition.symbol,
        quantity: mockPosition.quantity,
        avgPrice: mockPosition.avgPrice,
        openedAt: mockPosition.openedAt,
        closedAt: undefined,
        pnlRealized: mockPosition.pnlRealized,
      });
      expect(mockPrismaService.position.create).toHaveBeenCalledWith({
        data: createPositionDto,
      });
    });
  });

  describe('findActivePositions', () => {
    it('should return active positions for a portfolio', async () => {
      const positions = [mockPosition];
      mockPrismaService.position.findMany.mockResolvedValue(positions);

      const result = await service.findActivePositions('portfolio1');

      expect(result).toHaveLength(1);
      expect(mockPrismaService.position.findMany).toHaveBeenCalledWith({
        where: {
          portfolioId: 'portfolio1',
          closedAt: null,
        },
      });
    });
  });

  describe('closePosition', () => {
    it('should close a position with PnL', async () => {
      const closedPosition = {
        ...mockPosition,
        closedAt: new Date(),
        pnlRealized: 1250.5,
      };
      mockPrismaService.position.update.mockResolvedValue(closedPosition);

      const result = await service.closePosition('1', 1250.5);

      expect(result.pnlRealized).toBe(1250.5);
      expect(result.closedAt).toBeDefined();
      expect(mockPrismaService.position.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          closedAt: expect.any(Date),
          pnlRealized: 1250.5,
        },
      });
    });
  });
});
