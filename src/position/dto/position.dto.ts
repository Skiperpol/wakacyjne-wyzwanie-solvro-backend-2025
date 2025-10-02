import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreatePositionDto {
  @ApiProperty({ example: 'clx1234567890' })
  @IsString()
  portfolioId: string;

  @ApiProperty({ example: 'AAPL' })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 100.5 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 150.25 })
  @IsNumber()
  avgPrice: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsDateString()
  openedAt: Date;

  @ApiPropertyOptional({ example: '2024-01-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  closedAt?: Date;

  @ApiPropertyOptional({ example: 1250.5 })
  @IsOptional()
  @IsNumber()
  pnlRealized?: number;
}

export class UpdatePositionDto {
  @ApiPropertyOptional({ example: 'AAPL' })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiPropertyOptional({ example: 100.5 })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ example: 150.25 })
  @IsOptional()
  @IsNumber()
  avgPrice?: number;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  openedAt?: Date;

  @ApiPropertyOptional({ example: '2024-01-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  closedAt?: Date;

  @ApiPropertyOptional({ example: 1250.5 })
  @IsOptional()
  @IsNumber()
  pnlRealized?: number;
}

export class PositionResponseDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ example: 'clx1234567890' })
  portfolioId: string;

  @ApiProperty({ example: 'AAPL' })
  symbol: string;

  @ApiProperty({ example: 100.5 })
  quantity: number;

  @ApiProperty({ example: 150.25 })
  avgPrice: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  openedAt: Date;

  @ApiPropertyOptional({ example: '2024-01-15T00:00:00.000Z' })
  closedAt?: Date;

  @ApiProperty({ example: 1250.5 })
  pnlRealized: number;
}
