import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateGameOptionsDto {
  @ApiProperty({ example: 'clx1234567890' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  startingBalance: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  leverageMax: number;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  riskPerTradePct: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  takeProfitPctDefault: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  stopLossPctDefault: number;

  @ApiProperty({ example: '1h' })
  @IsString()
  timeframeDefault: string;
}

export class UpdateGameOptionsDto {
  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @IsNumber()
  startingBalance?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  leverageMax?: number;

  @ApiPropertyOptional({ example: 2.5 })
  @IsOptional()
  @IsNumber()
  riskPerTradePct?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsNumber()
  takeProfitPctDefault?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  stopLossPctDefault?: number;

  @ApiPropertyOptional({ example: '4h' })
  @IsOptional()
  @IsString()
  timeframeDefault?: string;
}

export class GameOptionsResponseDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ example: 'clx1234567890' })
  userId: string;

  @ApiProperty({ example: 10000 })
  startingBalance: number;

  @ApiProperty({ example: 10 })
  leverageMax: number;

  @ApiProperty({ example: 2.5 })
  riskPerTradePct: number;

  @ApiProperty({ example: 15 })
  takeProfitPctDefault: number;

  @ApiProperty({ example: 5 })
  stopLossPctDefault: number;

  @ApiProperty({ example: '1h' })
  timeframeDefault: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
