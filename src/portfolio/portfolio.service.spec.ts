import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from './portfolio.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto/portfolio.dto';

describe('PortfolioService', () => {
  let service: PortfolioService;

  const mockPortfolio = {
    id: 'clx1234567890',
    userId: 'user-1',
    name: 'My Trading Portfolio',
    baseCurrency: 'USD',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockPortfolio2 = {
    id: 'clx1234567891',
    userId: 'user-1',
    name: 'Crypto Portfolio',
    baseCurrency: 'EUR',
    createdAt: new Date('2024-01-02T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  };

  const mockPortfolioWithDifferentCurrency = {
    id: 'clx1234567892',
    userId: 'user-2',
    name: 'JPY Portfolio',
    baseCurrency: 'JPY',
    createdAt: new Date('2024-01-03T00:00:00.000Z'),
    updatedAt: new Date('2024-01-03T00:00:00.000Z'),
  };

  const mockPrismaService = {
    portfolio: {
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
        PortfolioService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const validCreatePortfolioDto: CreatePortfolioDto = {
      userId: 'user-1',
      name: 'My Trading Portfolio',
      baseCurrency: 'USD',
    };

    it('should create a portfolio successfully with valid data', async () => {
      mockPrismaService.portfolio.create.mockResolvedValue(mockPortfolio);

      const result = await service.create(validCreatePortfolioDto);

      expect(result).toEqual({
        id: mockPortfolio.id,
        userId: mockPortfolio.userId,
        name: mockPortfolio.name,
        baseCurrency: mockPortfolio.baseCurrency,
        createdAt: mockPortfolio.createdAt,
        updatedAt: mockPortfolio.updatedAt,
      });
      expect(mockPrismaService.portfolio.create).toHaveBeenCalledWith({
        data: validCreatePortfolioDto,
      });
      expect(mockPrismaService.portfolio.create).toHaveBeenCalledTimes(1);
    });

    it('should create a portfolio with different currency', async () => {
      const eurPortfolioDto: CreatePortfolioDto = {
        userId: 'user-1',
        name: 'EUR Portfolio',
        baseCurrency: 'EUR',
      };
      const eurPortfolio = { ...mockPortfolio, ...eurPortfolioDto };
      mockPrismaService.portfolio.create.mockResolvedValue(eurPortfolio);

      const result = await service.create(eurPortfolioDto);

      expect(result.userId).toBe(eurPortfolioDto.userId);
      expect(result.name).toBe(eurPortfolioDto.name);
      expect(result.baseCurrency).toBe('EUR');
      expect(mockPrismaService.portfolio.create).toHaveBeenCalledWith({
        data: eurPortfolioDto,
      });
    });

    it('should create a portfolio with JPY currency', async () => {
      const jpyPortfolioDto: CreatePortfolioDto = {
        userId: 'user-2',
        name: 'JPY Portfolio',
        baseCurrency: 'JPY',
      };
      mockPrismaService.portfolio.create.mockResolvedValue(
        mockPortfolioWithDifferentCurrency,
      );

      const result = await service.create(jpyPortfolioDto);

      expect(result.baseCurrency).toBe('JPY');
      expect(result.name).toBe('JPY Portfolio');
      expect(mockPrismaService.portfolio.create).toHaveBeenCalledWith({
        data: jpyPortfolioDto,
      });
    });

    it('should create a portfolio with crypto currency', async () => {
      const cryptoPortfolioDto: CreatePortfolioDto = {
        userId: 'user-1',
        name: 'Crypto Portfolio',
        baseCurrency: 'BTC',
      };
      const cryptoPortfolio = { ...mockPortfolio, baseCurrency: 'BTC' };
      mockPrismaService.portfolio.create.mockResolvedValue(cryptoPortfolio);

      const result = await service.create(cryptoPortfolioDto);

      expect(result.baseCurrency).toBe('BTC');
      expect(mockPrismaService.portfolio.create).toHaveBeenCalledWith({
        data: cryptoPortfolioDto,
      });
    });

    it('should handle database errors during creation', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaService.portfolio.create.mockRejectedValue(dbError);

      await expect(service.create(validCreatePortfolioDto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle foreign key constraint violations', async () => {
      const fkError = new Error('Foreign key constraint failed');
      mockPrismaService.portfolio.create.mockRejectedValue(fkError);

      await expect(
        service.create({
          userId: 'non-existent-user',
          name: 'Test Portfolio',
          baseCurrency: 'USD',
        }),
      ).rejects.toThrow('Foreign key constraint failed');
    });

    it('should handle unique constraint violations', async () => {
      const uniqueError = new Error('Unique constraint failed');
      mockPrismaService.portfolio.create.mockRejectedValue(uniqueError);

      await expect(service.create(validCreatePortfolioDto)).rejects.toThrow(
        'Unique constraint failed',
      );
    });
  });

  describe('findAll', () => {
    it('should return all portfolios when portfolios exist', async () => {
      const portfolios = [
        mockPortfolio,
        mockPortfolio2,
        mockPortfolioWithDifferentCurrency,
      ];
      mockPrismaService.portfolio.findMany.mockResolvedValue(portfolios);

      const result = await service.findAll();

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: mockPortfolio.id,
        userId: mockPortfolio.userId,
        name: mockPortfolio.name,
        baseCurrency: mockPortfolio.baseCurrency,
        createdAt: mockPortfolio.createdAt,
        updatedAt: mockPortfolio.updatedAt,
      });
      expect(result[1]).toEqual({
        id: mockPortfolio2.id,
        userId: mockPortfolio2.userId,
        name: mockPortfolio2.name,
        baseCurrency: mockPortfolio2.baseCurrency,
        createdAt: mockPortfolio2.createdAt,
        updatedAt: mockPortfolio2.updatedAt,
      });
      expect(result[2].baseCurrency).toBe('JPY');
      expect(mockPrismaService.portfolio.findMany).toHaveBeenCalledWith();
    });

    it('should return empty array when no portfolios exist', async () => {
      mockPrismaService.portfolio.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockPrismaService.portfolio.findMany).toHaveBeenCalledWith();
    });

    it('should handle database errors during findAll', async () => {
      const dbError = new Error('Database timeout');
      mockPrismaService.portfolio.findMany.mockRejectedValue(dbError);

      await expect(service.findAll()).rejects.toThrow('Database timeout');
    });
  });

  describe('findByUserId', () => {
    it('should return portfolios for specific user', async () => {
      const userPortfolios = [mockPortfolio, mockPortfolio2];
      mockPrismaService.portfolio.findMany.mockResolvedValue(userPortfolios);

      const result = await service.findByUserId('user-1');

      expect(result).toHaveLength(2);
      expect(result.every((portfolio) => portfolio.userId === 'user-1')).toBe(
        true,
      );
      expect(mockPrismaService.portfolio.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('should return empty array for user with no portfolios', async () => {
      mockPrismaService.portfolio.findMany.mockResolvedValue([]);

      const result = await service.findByUserId('user-with-no-portfolios');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockPrismaService.portfolio.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-with-no-portfolios' },
      });
    });

    it('should handle invalid user ID format', async () => {
      mockPrismaService.portfolio.findMany.mockResolvedValue([]);

      const result = await service.findByUserId('');

      expect(result).toEqual([]);
      expect(mockPrismaService.portfolio.findMany).toHaveBeenCalledWith({
        where: { userId: '' },
      });
    });

    it('should handle malformed user ID', async () => {
      const malformedUserId = 'invalid-format';
      mockPrismaService.portfolio.findMany.mockResolvedValue([]);

      const result = await service.findByUserId(malformedUserId);

      expect(result).toEqual([]);
      expect(mockPrismaService.portfolio.findMany).toHaveBeenCalledWith({
        where: { userId: malformedUserId },
      });
    });
  });

  describe('findOne', () => {
    it('should return a portfolio when found with valid ID', async () => {
      mockPrismaService.portfolio.findUnique.mockResolvedValue(mockPortfolio);

      const result = await service.findOne(mockPortfolio.id);

      expect(result).toEqual({
        id: mockPortfolio.id,
        userId: mockPortfolio.userId,
        name: mockPortfolio.name,
        baseCurrency: mockPortfolio.baseCurrency,
        createdAt: mockPortfolio.createdAt,
        updatedAt: mockPortfolio.updatedAt,
      });
      expect(mockPrismaService.portfolio.findUnique).toHaveBeenCalledWith({
        where: { id: mockPortfolio.id },
      });
    });

    it('should throw NotFoundException when portfolio not found', async () => {
      const nonExistentId = 'non-existent-id';
      mockPrismaService.portfolio.findUnique.mockResolvedValue(null);

      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        `Portfolio with ID ${nonExistentId} not found`,
      );
    });

    it('should handle empty string ID', async () => {
      mockPrismaService.portfolio.findUnique.mockResolvedValue(null);

      await expect(service.findOne('')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('')).rejects.toThrow(
        'Portfolio with ID  not found',
      );
    });

    it('should handle malformed ID', async () => {
      const malformedId = 'invalid-format';
      mockPrismaService.portfolio.findUnique.mockResolvedValue(null);

      await expect(service.findOne(malformedId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updatePortfolioDto: UpdatePortfolioDto = {
      name: 'Updated Portfolio Name',
      baseCurrency: 'EUR',
    };

    it('should update a portfolio successfully with valid data', async () => {
      const updatedPortfolio = { ...mockPortfolio, ...updatePortfolioDto };
      mockPrismaService.portfolio.update.mockResolvedValue(updatedPortfolio);

      const result = await service.update(mockPortfolio.id, updatePortfolioDto);

      expect(result).toEqual({
        id: mockPortfolio.id,
        userId: mockPortfolio.userId,
        name: updatePortfolioDto.name,
        baseCurrency: updatePortfolioDto.baseCurrency,
        createdAt: mockPortfolio.createdAt,
        updatedAt: mockPortfolio.updatedAt,
      });
      expect(mockPrismaService.portfolio.update).toHaveBeenCalledWith({
        where: { id: mockPortfolio.id },
        data: updatePortfolioDto,
      });
    });

    it('should update only name when only name provided', async () => {
      const partialUpdate = { name: 'Only Name Updated' };
      const updatedPortfolio = { ...mockPortfolio, ...partialUpdate };
      mockPrismaService.portfolio.update.mockResolvedValue(updatedPortfolio);

      const result = await service.update(mockPortfolio.id, partialUpdate);

      expect(result.name).toBe(partialUpdate.name);
      expect(result.baseCurrency).toBe(mockPortfolio.baseCurrency); // Should remain unchanged
      expect(mockPrismaService.portfolio.update).toHaveBeenCalledWith({
        where: { id: mockPortfolio.id },
        data: partialUpdate,
      });
    });

    it('should update only currency when only currency provided', async () => {
      const partialUpdate = { baseCurrency: 'JPY' };
      const updatedPortfolio = { ...mockPortfolio, ...partialUpdate };
      mockPrismaService.portfolio.update.mockResolvedValue(updatedPortfolio);

      const result = await service.update(mockPortfolio.id, partialUpdate);

      expect(result.baseCurrency).toBe(partialUpdate.baseCurrency);
      expect(result.name).toBe(mockPortfolio.name); // Should remain unchanged
    });

    it('should update currency to different type', async () => {
      const currencyUpdate = { baseCurrency: 'GBP' };
      const updatedPortfolio = { ...mockPortfolio, ...currencyUpdate };
      mockPrismaService.portfolio.update.mockResolvedValue(updatedPortfolio);

      const result = await service.update(mockPortfolio.id, currencyUpdate);

      expect(result.baseCurrency).toBe('GBP');
      expect(mockPrismaService.portfolio.update).toHaveBeenCalledWith({
        where: { id: mockPortfolio.id },
        data: currencyUpdate,
      });
    });

    it('should update currency to crypto', async () => {
      const cryptoUpdate = { baseCurrency: 'ETH' };
      const updatedPortfolio = { ...mockPortfolio, ...cryptoUpdate };
      mockPrismaService.portfolio.update.mockResolvedValue(updatedPortfolio);

      const result = await service.update(mockPortfolio.id, cryptoUpdate);

      expect(result.baseCurrency).toBe('ETH');
      expect(mockPrismaService.portfolio.update).toHaveBeenCalledWith({
        where: { id: mockPortfolio.id },
        data: cryptoUpdate,
      });
    });

    it('should throw NotFoundException when portfolio not found for update', async () => {
      const nonExistentId = 'non-existent-id';
      mockPrismaService.portfolio.update.mockRejectedValue({ code: 'P2025' });

      await expect(
        service.update(nonExistentId, updatePortfolioDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(nonExistentId, updatePortfolioDto),
      ).rejects.toThrow(`Portfolio with ID ${nonExistentId} not found`);
    });

    it('should re-throw other Prisma errors during update', async () => {
      const otherError = new Error('Database constraint violation');
      mockPrismaService.portfolio.update.mockRejectedValue(otherError);

      await expect(
        service.update(mockPortfolio.id, updatePortfolioDto),
      ).rejects.toThrow('Database constraint violation');
    });

    it('should handle empty update object', async () => {
      const emptyUpdate = {};
      const unchangedPortfolio = { ...mockPortfolio };
      mockPrismaService.portfolio.update.mockResolvedValue(unchangedPortfolio);

      const result = await service.update(mockPortfolio.id, emptyUpdate);

      expect(result).toEqual({
        id: mockPortfolio.id,
        userId: mockPortfolio.userId,
        name: mockPortfolio.name,
        baseCurrency: mockPortfolio.baseCurrency,
        createdAt: mockPortfolio.createdAt,
        updatedAt: mockPortfolio.updatedAt,
      });
    });
  });

  describe('remove', () => {
    it('should delete a portfolio successfully', async () => {
      mockPrismaService.portfolio.delete.mockResolvedValue(mockPortfolio);

      await service.remove(mockPortfolio.id);

      expect(mockPrismaService.portfolio.delete).toHaveBeenCalledWith({
        where: { id: mockPortfolio.id },
      });
      expect(mockPrismaService.portfolio.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when portfolio not found for deletion', async () => {
      const nonExistentId = 'non-existent-id';
      mockPrismaService.portfolio.delete.mockRejectedValue({ code: 'P2025' });

      await expect(service.remove(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove(nonExistentId)).rejects.toThrow(
        `Portfolio with ID ${nonExistentId} not found`,
      );
    });

    it('should re-throw other Prisma errors during deletion', async () => {
      const otherError = new Error('Foreign key constraint violation');
      mockPrismaService.portfolio.delete.mockRejectedValue(otherError);

      await expect(service.remove(mockPortfolio.id)).rejects.toThrow(
        'Foreign key constraint violation',
      );
    });

    it('should handle cascade deletion properly', async () => {
      mockPrismaService.portfolio.delete.mockResolvedValue(mockPortfolio);
      await expect(service.remove(mockPortfolio.id)).resolves.not.toThrow();
      expect(mockPrismaService.portfolio.delete).toHaveBeenCalledWith({
        where: { id: mockPortfolio.id },
      });
    });
  });

  describe('mapToResponseDto', () => {
    it('should map portfolio data correctly', () => {
      mockPrismaService.portfolio.create.mockResolvedValue(mockPortfolio);
      return service
        .create({
          userId: mockPortfolio.userId,
          name: mockPortfolio.name,
          baseCurrency: mockPortfolio.baseCurrency,
        })
        .then((result) => {
          expect(result.id).toBe(mockPortfolio.id);
          expect(result.userId).toBe(mockPortfolio.userId);
          expect(result.name).toBe(mockPortfolio.name);
          expect(result.baseCurrency).toBe(mockPortfolio.baseCurrency);
          expect(result.createdAt).toEqual(mockPortfolio.createdAt);
          expect(result.updatedAt).toEqual(mockPortfolio.updatedAt);
        });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete portfolio lifecycle', async () => {
      mockPrismaService.portfolio.create.mockResolvedValue(mockPortfolio);
      const createdPortfolio = await service.create({
        userId: mockPortfolio.userId,
        name: mockPortfolio.name,
        baseCurrency: mockPortfolio.baseCurrency,
      });

      mockPrismaService.portfolio.findUnique.mockResolvedValue(mockPortfolio);
      const foundPortfolio = await service.findOne(createdPortfolio.id);

      const updatedPortfolioData = {
        ...mockPortfolio,
        name: 'Updated Portfolio Name',
        baseCurrency: 'EUR',
      };
      mockPrismaService.portfolio.update.mockResolvedValue(
        updatedPortfolioData,
      );
      const updatedPortfolio = await service.update(foundPortfolio.id, {
        name: 'Updated Portfolio Name',
        baseCurrency: 'EUR',
      });

      mockPrismaService.portfolio.delete.mockResolvedValue(
        updatedPortfolioData,
      );
      await service.remove(updatedPortfolio.id);

      expect(createdPortfolio.id).toBe(foundPortfolio.id);
      expect(updatedPortfolio.name).toBe('Updated Portfolio Name');
      expect(updatedPortfolio.baseCurrency).toBe('EUR');
      expect(mockPrismaService.portfolio.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.portfolio.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.portfolio.update).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.portfolio.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent operations', async () => {
      mockPrismaService.portfolio.create.mockResolvedValue(mockPortfolio);
      mockPrismaService.portfolio.findMany.mockResolvedValue([
        mockPortfolio,
        mockPortfolio2,
      ]);

      const [createdPortfolio, allPortfolios] = await Promise.all([
        service.create({
          userId: mockPortfolio.userId,
          name: mockPortfolio.name,
          baseCurrency: mockPortfolio.baseCurrency,
        }),
        service.findAll(),
      ]);

      expect(createdPortfolio).toBeDefined();
      expect(allPortfolios).toHaveLength(2);
    });

    it('should handle multiple portfolios per user', async () => {
      const userPortfolios = [mockPortfolio, mockPortfolio2];
      mockPrismaService.portfolio.findMany.mockResolvedValue(userPortfolios);

      const result = await service.findByUserId('user-1');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('My Trading Portfolio');
      expect(result[1].name).toBe('Crypto Portfolio');
      expect(result.every((portfolio) => portfolio.userId === 'user-1')).toBe(
        true,
      );
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle very long portfolio names', async () => {
      const longName =
        'This is a very long portfolio name that might exceed normal limits but should still be handled properly by the system without any issues';
      const longNamePortfolio = { ...mockPortfolio, name: longName };
      mockPrismaService.portfolio.create.mockResolvedValue(longNamePortfolio);

      const result = await service.create({
        userId: mockPortfolio.userId,
        name: longName,
        baseCurrency: mockPortfolio.baseCurrency,
      });

      expect(result.name).toBe(longName);
    });

    it('should handle special characters in portfolio names', async () => {
      const specialName = 'Portfolio @#$%^&*()_+{}|:"<>?[]\\;\',./';
      const specialNamePortfolio = { ...mockPortfolio, name: specialName };
      mockPrismaService.portfolio.create.mockResolvedValue(
        specialNamePortfolio,
      );

      const result = await service.create({
        userId: mockPortfolio.userId,
        name: specialName,
        baseCurrency: mockPortfolio.baseCurrency,
      });

      expect(result.name).toBe(specialName);
    });

    it('should handle empty portfolio name', async () => {
      const emptyNamePortfolio = { ...mockPortfolio, name: '' };
      mockPrismaService.portfolio.create.mockResolvedValue(emptyNamePortfolio);

      const result = await service.create({
        userId: mockPortfolio.userId,
        name: '',
        baseCurrency: mockPortfolio.baseCurrency,
      });

      expect(result.name).toBe('');
    });

    it('should handle special currency codes', async () => {
      const specialCurrency = 'XAU'; // Gold
      const specialCurrencyPortfolio = {
        ...mockPortfolio,
        baseCurrency: specialCurrency,
      };
      mockPrismaService.portfolio.create.mockResolvedValue(
        specialCurrencyPortfolio,
      );

      const result = await service.create({
        userId: mockPortfolio.userId,
        name: mockPortfolio.name,
        baseCurrency: specialCurrency,
      });

      expect(result.baseCurrency).toBe(specialCurrency);
    });

    it('should handle database connection failures gracefully', async () => {
      const connectionError = new Error('Connection timeout');
      mockPrismaService.portfolio.findMany.mockRejectedValue(connectionError);

      await expect(service.findAll()).rejects.toThrow('Connection timeout');
    });

    it('should handle transaction rollbacks', async () => {
      const transactionError = new Error('Transaction rolled back');
      mockPrismaService.portfolio.create.mockRejectedValue(transactionError);

      await expect(
        service.create({
          userId: mockPortfolio.userId,
          name: mockPortfolio.name,
          baseCurrency: mockPortfolio.baseCurrency,
        }),
      ).rejects.toThrow('Transaction rolled back');
    });
  });
});
