import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSessionDto,
  UpdateSessionDto,
  SessionResponseDto,
} from './dto/session.dto';
import { Session } from '@prisma/client';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async create(
    createSessionDto: CreateSessionDto,
  ): Promise<SessionResponseDto> {
    const session = await this.prisma.session.create({
      data: createSessionDto,
    });
    return this.mapToResponseDto(session);
  }

  async findAll(): Promise<SessionResponseDto[]> {
    const sessions = await this.prisma.session.findMany();
    return sessions.map((session) => this.mapToResponseDto(session));
  }

  async findByUserId(userId: string): Promise<SessionResponseDto[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
    });
    return sessions.map((session) => this.mapToResponseDto(session));
  }

  async findOne(id: string): Promise<SessionResponseDto> {
    const session = await this.prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return this.mapToResponseDto(session);
  }

  async update(
    id: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<SessionResponseDto> {
    try {
      const session = await this.prisma.session.update({
        where: { id },
        data: updateSessionDto,
      });
      return this.mapToResponseDto(session);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.session.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }
      throw error;
    }
  }

  async removeByUserId(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  async removeExpired(): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  private mapToResponseDto(session: Session): SessionResponseDto {
    return {
      id: session.id,
      userId: session.userId,
      refreshTokenHash: session.refreshTokenHash,
      ip: session.ip,
      userAgent: session.userAgent,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
    };
  }
}
