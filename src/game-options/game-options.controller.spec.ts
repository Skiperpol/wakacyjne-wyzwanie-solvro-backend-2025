import { Test, TestingModule } from '@nestjs/testing';
import { GameOptionsController } from './game-options.controller';
import { GameOptionsService } from './game-options.service';

describe('GameOptionsController', () => {
  let controller: GameOptionsController;
  let gameOptionsService: GameOptionsService;

  const mockGameOptions = {
    id: '1',
    userId: 'user1',
    startingBalance: 10000,
    leverageMax: 10,
    riskPerTradePct: 2.5,
    takeProfitPctDefault: 15,
    stopLossPctDefault: 5,
    timeframeDefault: '1h',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockGameOptionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByUserId: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateByUserId: jest.fn(),
    upsert: jest.fn(),
    remove: jest.fn(),
    removeByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameOptionsController],
      providers: [
        {
          provide: GameOptionsService,
          useValue: mockGameOptionsService,
        },
      ],
    }).compile();

    controller = module.get<GameOptionsController>(GameOptionsController);
    gameOptionsService = module.get<GameOptionsService>(GameOptionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create game options', async () => {
      const createGameOptionsDto = {
        userId: 'user1',
        startingBalance: 10000,
        leverageMax: 10,
        riskPerTradePct: 2.5,
        takeProfitPctDefault: 15,
        stopLossPctDefault: 5,
        timeframeDefault: '1h',
      };

      mockGameOptionsService.create.mockResolvedValue(mockGameOptions);

      const result = await controller.create(createGameOptionsDto);

      expect(result).toEqual(mockGameOptions);
      expect(gameOptionsService.create).toHaveBeenCalledWith(
        createGameOptionsDto,
      );
    });
  });

  describe('upsert', () => {
    it('should create or update game options', async () => {
      const updateGameOptionsDto = {
        startingBalance: 15000,
        leverageMax: 15,
      };

      const upsertedOptions = { ...mockGameOptions, ...updateGameOptionsDto };
      mockGameOptionsService.upsert.mockResolvedValue(upsertedOptions);

      const result = await controller.upsert('user1', updateGameOptionsDto);

      expect(result).toEqual(upsertedOptions);
      expect(gameOptionsService.upsert).toHaveBeenCalledWith(
        'user1',
        updateGameOptionsDto,
      );
    });
  });

  describe('findByUserId', () => {
    it('should return game options by user ID', async () => {
      mockGameOptionsService.findByUserId.mockResolvedValue(mockGameOptions);

      const result = await controller.findByUserId('user1');

      expect(result).toEqual(mockGameOptions);
      expect(gameOptionsService.findByUserId).toHaveBeenCalledWith('user1');
    });
  });
});
