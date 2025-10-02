import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ example: 'clx1234567890' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'hashed_refresh_token' })
  @IsString()
  refreshTokenHash: string;

  @ApiProperty({ example: '192.168.1.1' })
  @IsString()
  ip: string;

  @ApiProperty({
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  @IsString()
  userAgent: string;

  @ApiProperty({ example: '2024-02-01T00:00:00.000Z' })
  @IsDateString()
  expiresAt: Date;
}

export class UpdateSessionDto {
  @ApiPropertyOptional({ example: 'hashed_refresh_token' })
  @IsOptional()
  @IsString()
  refreshTokenHash?: string;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiPropertyOptional({
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ example: '2024-02-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}

export class SessionResponseDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ example: 'clx1234567890' })
  userId: string;

  @ApiProperty({ example: 'hashed_refresh_token' })
  refreshTokenHash: string;

  @ApiProperty({ example: '192.168.1.1' })
  ip: string;

  @ApiProperty({
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  userAgent: string;

  @ApiProperty({ example: '2024-02-01T00:00:00.000Z' })
  expiresAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}
