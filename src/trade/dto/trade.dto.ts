import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { TradeSide, TradeType, TradeStatus } from '@prisma/client';

export class CreateTradeDto {
  @ApiProperty({ example: 'clx1234567890' })
  @IsString()
  portfolioId: string;

  @ApiProperty({ example: 'AAPL' })
  @IsString()
  symbol: string;

  @ApiProperty({ enum: TradeSide, example: TradeSide.BUY })
  @IsEnum(TradeSide)
  side: TradeSide;

  @ApiProperty({ enum: TradeType, example: TradeType.MARKET })
  @IsEnum(TradeType)
  type: TradeType;

  @ApiProperty({ example: 100.5 })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ example: 150.25 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ enum: TradeStatus, example: TradeStatus.NEW })
  @IsOptional()
  @IsEnum(TradeStatus)
  status?: TradeStatus;

  @ApiPropertyOptional({ example: '2024-01-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  filledAt?: Date;

  @ApiPropertyOptional({ example: 'Insufficient funds' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class UpdateTradeDto {
  @ApiPropertyOptional({ example: 'AAPL' })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiPropertyOptional({ enum: TradeSide, example: TradeSide.BUY })
  @IsOptional()
  @IsEnum(TradeSide)
  side?: TradeSide;

  @ApiPropertyOptional({ enum: TradeType, example: TradeType.MARKET })
  @IsOptional()
  @IsEnum(TradeType)
  type?: TradeType;

  @ApiPropertyOptional({ example: 100.5 })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ example: 150.25 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ enum: TradeStatus, example: TradeStatus.FILLED })
  @IsOptional()
  @IsEnum(TradeStatus)
  status?: TradeStatus;

  @ApiPropertyOptional({ example: '2024-01-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  filledAt?: Date;

  @ApiPropertyOptional({ example: 'Insufficient funds' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class TradeResponseDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ example: 'clx1234567890' })
  portfolioId: string;

  @ApiProperty({ example: 'AAPL' })
  symbol: string;

  @ApiProperty({ enum: TradeSide, example: TradeSide.BUY })
  side: TradeSide;

  @ApiProperty({ enum: TradeType, example: TradeType.MARKET })
  type: TradeType;

  @ApiProperty({ example: 100.5 })
  quantity: number;

  @ApiPropertyOptional({ example: 150.25 })
  price?: number;

  @ApiProperty({ enum: TradeStatus, example: TradeStatus.NEW })
  status: TradeStatus;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ example: '2024-01-15T00:00:00.000Z' })
  filledAt?: Date;

  @ApiPropertyOptional({ example: 'Insufficient funds' })
  rejectionReason?: string;
}
