import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';

describe('PortfolioController', () => {
  let controller: PortfolioController;

  const mockPortfolio = {
    id: '1',
    userId: 'user1',
    name: 'Test Portfolio',
    baseCurrency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPortfolioService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByUserId: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioController],
      providers: [
        {
          provide: PortfolioService,
          useValue: mockPortfolioService,
        },
      ],
    }).compile();

    controller = module.get<PortfolioController>(PortfolioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a portfolio', async () => {
      const createPortfolioDto = {
        userId: 'user1',
        name: 'Test Portfolio',
        baseCurrency: 'USD',
      };

      mockPortfolioService.create.mockResolvedValue(mockPortfolio);

      const result = await controller.create(createPortfolioDto);

      expect(result).toEqual(mockPortfolio);
      expect(mockPortfolioService.create).toHaveBeenCalledWith(
        createPortfolioDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all portfolios when no userId query', async () => {
      const portfolios = [mockPortfolio];
      mockPortfolioService.findAll.mockResolvedValue(portfolios);

      const result = await controller.findAll();

      expect(result).toEqual(portfolios);
      expect(mockPortfolioService.findAll).toHaveBeenCalled();
    });

    it('should return portfolios by userId when userId query provided', async () => {
      const portfolios = [mockPortfolio];
      mockPortfolioService.findByUserId.mockResolvedValue(portfolios);

      const result = await controller.findAll('user1');

      expect(result).toEqual(portfolios);
      expect(mockPortfolioService.findByUserId).toHaveBeenCalledWith('user1');
    });
  });

  describe('findByUserId', () => {
    it('should return portfolios by user ID', async () => {
      const portfolios = [mockPortfolio];
      mockPortfolioService.findByUserId.mockResolvedValue(portfolios);

      const result = await controller.findByUserId('user1');

      expect(result).toEqual(portfolios);
      expect(mockPortfolioService.findByUserId).toHaveBeenCalledWith('user1');
    });
  });
});
