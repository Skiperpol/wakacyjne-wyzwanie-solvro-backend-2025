import { Test, TestingModule } from '@nestjs/testing';
import { GameOptionsService } from './game-options.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('GameOptionsService', () => {
  let service: GameOptionsService;
  let prismaService: PrismaService;

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

  const mockPrismaService = {
    gameOptions: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameOptionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GameOptionsService>(GameOptionsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create game options successfully', async () => {
      const createGameOptionsDto = {
        userId: 'user1',
        startingBalance: 10000,
        leverageMax: 10,
        riskPerTradePct: 2.5,
        takeProfitPctDefault: 15,
        stopLossPctDefault: 5,
        timeframeDefault: '1h',
      };

      mockPrismaService.gameOptions.create.mockResolvedValue(mockGameOptions);

      const result = await service.create(createGameOptionsDto);

      expect(result).toEqual({
        id: mockGameOptions.id,
        userId: mockGameOptions.userId,
        startingBalance: mockGameOptions.startingBalance,
        leverageMax: mockGameOptions.leverageMax,
        riskPerTradePct: mockGameOptions.riskPerTradePct,
        takeProfitPctDefault: mockGameOptions.takeProfitPctDefault,
        stopLossPctDefault: mockGameOptions.stopLossPctDefault,
        timeframeDefault: mockGameOptions.timeframeDefault,
        createdAt: mockGameOptions.createdAt,
        updatedAt: mockGameOptions.updatedAt,
      });
      expect(mockPrismaService.gameOptions.create).toHaveBeenCalledWith({
        data: createGameOptionsDto,
      });
    });

    it('should throw ConflictException when game options already exist', async () => {
      const createGameOptionsDto = {
        userId: 'user1',
        startingBalance: 10000,
        leverageMax: 10,
        riskPerTradePct: 2.5,
        takeProfitPctDefault: 15,
        stopLossPctDefault: 5,
        timeframeDefault: '1h',
      };

      mockPrismaService.gameOptions.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create(createGameOptionsDto)).rejects.toThrow(
        ConflictException,
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
      mockPrismaService.gameOptions.upsert.mockResolvedValue(upsertedOptions);

      const result = await service.upsert('user1', updateGameOptionsDto);

      expect(result.startingBalance).toBe(15000);
      expect(result.leverageMax).toBe(15);
      expect(mockPrismaService.gameOptions.upsert).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        update: updateGameOptionsDto,
        create: {
          userId: 'user1',
          startingBalance: 15000,
          leverageMax: 15,
          riskPerTradePct: 2.5,
          takeProfitPctDefault: 15,
          stopLossPctDefault: 5,
          timeframeDefault: '1h',
        },
      });
    });
  });
});
