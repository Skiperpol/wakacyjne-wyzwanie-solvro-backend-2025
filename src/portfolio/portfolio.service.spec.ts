import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from './portfolio.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let prismaService: PrismaService;

  const mockPortfolio = {
    id: '1',
    userId: 'user1',
    name: 'Test Portfolio',
    baseCurrency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    portfolio: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a portfolio successfully', async () => {
      const createPortfolioDto = {
        userId: 'user1',
        name: 'Test Portfolio',
        baseCurrency: 'USD',
      };

      mockPrismaService.portfolio.create.mockResolvedValue(mockPortfolio);

      const result = await service.create(createPortfolioDto);

      expect(result).toEqual({
        id: mockPortfolio.id,
        userId: mockPortfolio.userId,
        name: mockPortfolio.name,
        baseCurrency: mockPortfolio.baseCurrency,
        createdAt: mockPortfolio.createdAt,
        updatedAt: mockPortfolio.updatedAt,
      });
      expect(mockPrismaService.portfolio.create).toHaveBeenCalledWith({
        data: createPortfolioDto,
      });
    });
  });

  describe('findOne', () => {
    it('should return a portfolio when found', async () => {
      mockPrismaService.portfolio.findUnique.mockResolvedValue(mockPortfolio);

      const result = await service.findOne('1');

      expect(result).toEqual({
        id: mockPortfolio.id,
        userId: mockPortfolio.userId,
        name: mockPortfolio.name,
        baseCurrency: mockPortfolio.baseCurrency,
        createdAt: mockPortfolio.createdAt,
        updatedAt: mockPortfolio.updatedAt,
      });
    });

    it('should throw NotFoundException when portfolio not found', async () => {
      mockPrismaService.portfolio.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('should return portfolios for a user', async () => {
      const portfolios = [mockPortfolio];
      mockPrismaService.portfolio.findMany.mockResolvedValue(portfolios);

      const result = await service.findByUserId('user1');

      expect(result).toHaveLength(1);
      expect(mockPrismaService.portfolio.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
      });
    });
  });
});
