import { Test, TestingModule } from '@nestjs/testing';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

describe('SessionController', () => {
  let controller: SessionController;

  const mockSession = {
    id: '1',
    userId: 'user1',
    refreshTokenHash: 'hashed_token',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    expiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date(),
  };

  const mockSessionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByUserId: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeByUserId: jest.fn(),
    removeExpired: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
      ],
    }).compile();

    controller = module.get<SessionController>(SessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a session', async () => {
      const createSessionDto = {
        userId: 'user1',
        refreshTokenHash: 'hashed_token',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        expiresAt: new Date(Date.now() + 3600000),
      };

      mockSessionService.create.mockResolvedValue(mockSession);

      const result = await controller.create(createSessionDto);

      expect(result).toEqual(mockSession);
      expect(mockSessionService.create).toHaveBeenCalledWith(createSessionDto);
    });
  });

  describe('findAll', () => {
    it('should return all sessions when no userId query', async () => {
      const sessions = [mockSession];
      mockSessionService.findAll.mockResolvedValue(sessions);

      const result = await controller.findAll();

      expect(result).toEqual(sessions);
      expect(mockSessionService.findAll).toHaveBeenCalled();
    });

    it('should return sessions by userId when userId query provided', async () => {
      const sessions = [mockSession];
      mockSessionService.findByUserId.mockResolvedValue(sessions);

      const result = await controller.findAll('user1');

      expect(result).toEqual(sessions);
      expect(mockSessionService.findByUserId).toHaveBeenCalledWith('user1');
    });
  });

  describe('removeExpired', () => {
    it('should remove expired sessions', async () => {
      mockSessionService.removeExpired.mockResolvedValue(undefined);

      await controller.removeExpired();

      expect(mockSessionService.removeExpired).toHaveBeenCalled();
    });
  });
});
