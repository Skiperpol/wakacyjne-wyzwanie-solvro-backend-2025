import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreatePortfolioDto {
  @ApiProperty({ example: 'clx1234567890' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'My Trading Portfolio' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  baseCurrency: string;
}

export class UpdatePortfolioDto {
  @ApiPropertyOptional({ example: 'My Trading Portfolio' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'EUR' })
  @IsOptional()
  @IsString()
  baseCurrency?: string;
}

export class PortfolioResponseDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ example: 'clx1234567890' })
  userId: string;

  @ApiProperty({ example: 'My Trading Portfolio' })
  name: string;

  @ApiProperty({ example: 'USD' })
  baseCurrency: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
