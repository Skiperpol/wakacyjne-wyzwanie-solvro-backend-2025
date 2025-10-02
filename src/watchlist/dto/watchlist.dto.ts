import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateWatchlistDto {
  @ApiProperty({ example: 'clx1234567890' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'Tech Stocks' })
  @IsString()
  name: string;
}

export class UpdateWatchlistDto {
  @ApiPropertyOptional({ example: 'Tech Stocks Watchlist' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class CreateWatchlistItemDto {
  @ApiProperty({ example: 'clx1234567890' })
  @IsString()
  watchlistId: string;

  @ApiProperty({ example: 'AAPL' })
  @IsString()
  symbol: string;

  @ApiPropertyOptional({ example: 'Apple Inc.' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  position?: number;
}

export class UpdateWatchlistItemDto {
  @ApiPropertyOptional({ example: 'AAPL' })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiPropertyOptional({ example: 'Apple Inc.' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  position?: number;
}

export class WatchlistResponseDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ example: 'clx1234567890' })
  userId: string;

  @ApiProperty({ example: 'Tech Stocks' })
  name: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}

export class WatchlistItemResponseDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ example: 'clx1234567890' })
  watchlistId: string;

  @ApiProperty({ example: 'AAPL' })
  symbol: string;

  @ApiPropertyOptional({ example: 'Apple Inc.' })
  note?: string;

  @ApiPropertyOptional({ example: 1 })
  position?: number;
}
