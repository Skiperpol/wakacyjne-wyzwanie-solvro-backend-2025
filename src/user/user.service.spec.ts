import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 'clx1234567890',
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedpassword',
    displayName: 'Test User',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockUser2 = {
    id: 'clx1234567891',
    email: 'test2@example.com',
    passwordHash: '$2b$10$hashedpassword2',
    displayName: 'Test User 2',
    createdAt: new Date('2024-01-02T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  };

  const mockPrismaService = {
    user: {
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
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const validCreateUserDto: CreateUserDto = {
      email: 'test@example.com',
      passwordHash: '$2b$10$hashedpassword',
      displayName: 'Test User',
    };

    it('should create a user successfully with valid data', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(validCreateUserDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        displayName: mockUser.displayName,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: validCreateUserDto,
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1);
    });

    it('should create a user with minimal required data', async () => {
      const minimalUserDto: CreateUserDto = {
        email: 'minimal@example.com',
        passwordHash: 'minimalhash',
        displayName: 'Minimal User',
      };
      const minimalUser = { ...mockUser, ...minimalUserDto };

      mockPrismaService.user.create.mockResolvedValue(minimalUser);

      const result = await service.create(minimalUserDto);

      expect(result.email).toBe(minimalUserDto.email);
      expect(result.displayName).toBe(minimalUserDto.displayName);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: minimalUserDto,
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrismaService.user.create.mockRejectedValue({ 
        code: 'P2002',
        meta: { target: ['email'] }
      });

      await expect(service.create(validCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(validCreateUserDto)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should re-throw other Prisma errors', async () => {
      const otherError = new Error('Database connection failed');
      mockPrismaService.user.create.mockRejectedValue(otherError);

      await expect(service.create(validCreateUserDto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle empty displayName', async () => {
      const userWithEmptyName: CreateUserDto = {
        ...validCreateUserDto,
        displayName: '',
      };
      const userWithEmptyNameResult = { ...mockUser, displayName: '' };

      mockPrismaService.user.create.mockResolvedValue(userWithEmptyNameResult);

      const result = await service.create(userWithEmptyName);

      expect(result.displayName).toBe('');
    });
  });

  describe('findAll', () => {
    it('should return all users when users exist', async () => {
      const users = [mockUser, mockUser2];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        displayName: mockUser.displayName,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result[1]).toEqual({
        id: mockUser2.id,
        email: mockUser2.email,
        displayName: mockUser2.displayName,
        createdAt: mockUser2.createdAt,
        updatedAt: mockUser2.updatedAt,
      });
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith();
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith();
    });

    it('should handle database errors during findAll', async () => {
      const dbError = new Error('Database timeout');
      mockPrismaService.user.findMany.mockRejectedValue(dbError);

      await expect(service.findAll()).rejects.toThrow('Database timeout');
    });
  });

  describe('findOne', () => {
    it('should return a user when found with valid ID', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        displayName: mockUser.displayName,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      const nonExistentId = 'non-existent-id';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        `User with ID ${nonExistentId} not found`,
      );
    });

    it('should handle empty string ID', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('')).rejects.toThrow(
        'User with ID  not found',
      );
    });

    it('should handle malformed ID', async () => {
      const malformedId = 'invalid-format';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(malformedId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found with valid email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        displayName: mockUser.displayName,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
    });

    it('should throw NotFoundException when user not found by email', async () => {
      const nonExistentEmail = 'nonexistent@example.com';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findByEmail(nonExistentEmail)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByEmail(nonExistentEmail)).rejects.toThrow(
        `User with email ${nonExistentEmail} not found`,
      );
    });

    it('should handle case-sensitive email lookup', async () => {
      const upperCaseEmail = 'TEST@EXAMPLE.COM';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findByEmail(upperCaseEmail)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle invalid email format', async () => {
      const invalidEmail = 'not-an-email';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findByEmail(invalidEmail)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      displayName: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should update a user successfully with valid data', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateUserDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: updateUserDto.email,
        displayName: updateUserDto.displayName,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: updateUserDto,
      });
    });

    it('should update only displayName when only displayName provided', async () => {
      const partialUpdate = { displayName: 'Only Name Updated' };
      const updatedUser = { ...mockUser, ...partialUpdate };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, partialUpdate);

      expect(result.displayName).toBe(partialUpdate.displayName);
      expect(result.email).toBe(mockUser.email); // Should remain unchanged
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: partialUpdate,
      });
    });

    it('should update only email when only email provided', async () => {
      const partialUpdate = { email: 'onlyemail@example.com' };
      const updatedUser = { ...mockUser, ...partialUpdate };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, partialUpdate);

      expect(result.email).toBe(partialUpdate.email);
      expect(result.displayName).toBe(mockUser.displayName); // Should remain unchanged
    });

    it('should update passwordHash when provided', async () => {
      const passwordUpdate = { passwordHash: 'newhashedpassword' };
      const updatedUser = { ...mockUser, ...passwordUpdate };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, passwordUpdate);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        displayName: mockUser.displayName,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: passwordUpdate,
      });
    });

    it('should throw NotFoundException when user not found for update', async () => {
      const nonExistentId = 'non-existent-id';
      mockPrismaService.user.update.mockRejectedValue({ code: 'P2025' });

      await expect(service.update(nonExistentId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(nonExistentId, updateUserDto)).rejects.toThrow(
        `User with ID ${nonExistentId} not found`,
      );
    });

    it('should throw ConflictException when email already exists during update', async () => {
      mockPrismaService.user.update.mockRejectedValue({ 
        code: 'P2002',
        meta: { target: ['email'] }
      });

      await expect(service.update(mockUser.id, updateUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.update(mockUser.id, updateUserDto)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should re-throw other Prisma errors during update', async () => {
      const otherError = new Error('Database constraint violation');
      mockPrismaService.user.update.mockRejectedValue(otherError);

      await expect(service.update(mockUser.id, updateUserDto)).rejects.toThrow(
        'Database constraint violation',
      );
    });

    it('should handle empty update object', async () => {
      const emptyUpdate = {};
      const unchangedUser = { ...mockUser };
      mockPrismaService.user.update.mockResolvedValue(unchangedUser);

      const result = await service.update(mockUser.id, emptyUpdate);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        displayName: mockUser.displayName,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      await service.remove(mockUser.id);

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(mockPrismaService.user.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user not found for deletion', async () => {
      const nonExistentId = 'non-existent-id';
      mockPrismaService.user.delete.mockRejectedValue({ code: 'P2025' });

      await expect(service.remove(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove(nonExistentId)).rejects.toThrow(
        `User with ID ${nonExistentId} not found`,
      );
    });

    it('should re-throw other Prisma errors during deletion', async () => {
      const otherError = new Error('Foreign key constraint violation');
      mockPrismaService.user.delete.mockRejectedValue(otherError);

      await expect(service.remove(mockUser.id)).rejects.toThrow(
        'Foreign key constraint violation',
      );
    });

    it('should handle cascade deletion properly', async () => {
      // Simulate successful deletion even when user has related records
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      await expect(service.remove(mockUser.id)).resolves.not.toThrow();
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });
  });

  describe('mapToResponseDto', () => {
    it('should map user data correctly without passwordHash', () => {
      // Test the private method indirectly through create
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      return service.create({
        email: mockUser.email,
        passwordHash: mockUser.passwordHash,
        displayName: mockUser.displayName,
      }).then((result) => {
        expect(result).not.toHaveProperty('passwordHash');
        expect(result.id).toBe(mockUser.id);
        expect(result.email).toBe(mockUser.email);
        expect(result.displayName).toBe(mockUser.displayName);
        expect(result.createdAt).toEqual(mockUser.createdAt);
        expect(result.updatedAt).toEqual(mockUser.updatedAt);
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete user lifecycle', async () => {
      // Create
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      const createdUser = await service.create({
        email: mockUser.email,
        passwordHash: mockUser.passwordHash,
        displayName: mockUser.displayName,
      });

      // Find
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const foundUser = await service.findOne(createdUser.id);

      // Update
      const updatedUserData = { ...mockUser, displayName: 'Updated Name' };
      mockPrismaService.user.update.mockResolvedValue(updatedUserData);
      const updatedUser = await service.update(foundUser.id, { displayName: 'Updated Name' });

      // Delete
      mockPrismaService.user.delete.mockResolvedValue(updatedUserData);
      await service.remove(updatedUser.id);

      expect(createdUser.id).toBe(foundUser.id);
      expect(updatedUser.displayName).toBe('Updated Name');
      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent operations', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.user.findMany.mockResolvedValue([mockUser, mockUser2]);

      // Simulate concurrent operations
      const [createdUser, allUsers] = await Promise.all([
        service.create({
          email: mockUser.email,
          passwordHash: mockUser.passwordHash,
          displayName: mockUser.displayName,
        }),
        service.findAll(),
      ]);

      expect(createdUser).toBeDefined();
      expect(allUsers).toHaveLength(2);
    });
  });
});