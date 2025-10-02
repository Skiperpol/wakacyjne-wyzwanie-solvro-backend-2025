import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SessionService', () => {
  let service: SessionService;
  let prismaService: PrismaService;

  const mockSession = {
    id: '1',
    userId: 'user1',
    refreshTokenHash: 'hashed_token',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    expiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date(),
  };

  const mockPrismaService = {
    session: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a session successfully', async () => {
      const createSessionDto = {
        userId: 'user1',
        refreshTokenHash: 'hashed_token',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        expiresAt: new Date(Date.now() + 3600000),
      };

      mockPrismaService.session.create.mockResolvedValue(mockSession);

      const result = await service.create(createSessionDto);

      expect(result).toEqual({
        id: mockSession.id,
        userId: mockSession.userId,
        refreshTokenHash: mockSession.refreshTokenHash,
        ip: mockSession.ip,
        userAgent: mockSession.userAgent,
        expiresAt: mockSession.expiresAt,
        createdAt: mockSession.createdAt,
      });
      expect(mockPrismaService.session.create).toHaveBeenCalledWith({
        data: createSessionDto,
      });
    });
  });

  describe('findOne', () => {
    it('should return a session when found', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(mockSession);

      const result = await service.findOne('1');

      expect(result).toEqual({
        id: mockSession.id,
        userId: mockSession.userId,
        refreshTokenHash: mockSession.refreshTokenHash,
        ip: mockSession.ip,
        userAgent: mockSession.userAgent,
        expiresAt: mockSession.expiresAt,
        createdAt: mockSession.createdAt,
      });
    });

    it('should throw NotFoundException when session not found', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeExpired', () => {
    it('should remove expired sessions', async () => {
      mockPrismaService.session.deleteMany.mockResolvedValue({ count: 2 });

      await service.removeExpired();

      expect(mockPrismaService.session.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      });
    });
  });
});
