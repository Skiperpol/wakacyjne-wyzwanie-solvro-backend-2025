import { Test, TestingModule } from '@nestjs/testing';
import { PositionController } from './position.controller';
import { PositionService } from './position.service';

describe('PositionController', () => {
  let controller: PositionController;
  let positionService: PositionService;

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

  const mockPositionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPortfolioId: jest.fn(),
    findActivePositions: jest.fn(),
    findClosedPositions: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    closePosition: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PositionController],
      providers: [
        {
          provide: PositionService,
          useValue: mockPositionService,
        },
      ],
    }).compile();

    controller = module.get<PositionController>(PositionController);
    positionService = module.get<PositionService>(PositionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a position', async () => {
      const createPositionDto = {
        portfolioId: 'portfolio1',
        symbol: 'AAPL',
        quantity: 100.5,
        avgPrice: 150.25,
        openedAt: new Date(),
      };

      mockPositionService.create.mockResolvedValue(mockPosition);

      const result = await controller.create(createPositionDto);

      expect(result).toEqual(mockPosition);
      expect(positionService.create).toHaveBeenCalledWith(createPositionDto);
    });
  });

  describe('findAll', () => {
    it('should return all positions when no filters', async () => {
      const positions = [mockPosition];
      mockPositionService.findAll.mockResolvedValue(positions);

      const result = await controller.findAll();

      expect(result).toEqual(positions);
      expect(positionService.findAll).toHaveBeenCalled();
    });

    it('should return active positions when status=active', async () => {
      const positions = [mockPosition];
      mockPositionService.findActivePositions.mockResolvedValue(positions);

      const result = await controller.findAll('portfolio1', 'active');

      expect(result).toEqual(positions);
      expect(positionService.findActivePositions).toHaveBeenCalledWith(
        'portfolio1',
      );
    });
  });

  describe('closePosition', () => {
    it('should close a position with PnL', async () => {
      const closedPosition = {
        ...mockPosition,
        closedAt: new Date(),
        pnlRealized: 1250.5,
      };
      mockPositionService.closePosition.mockResolvedValue(closedPosition);

      const result = await controller.closePosition('1', 1250.5);

      expect(result).toEqual(closedPosition);
      expect(positionService.closePosition).toHaveBeenCalledWith('1', 1250.5);
    });
  });
});
