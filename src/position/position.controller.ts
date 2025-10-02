import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { PositionService } from './position.service';
import {
  CreatePositionDto,
  UpdatePositionDto,
  PositionResponseDto,
} from './dto/position.dto';

@ApiTags('Positions')
@Controller('positions')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new position' })
  @ApiBody({ type: CreatePositionDto })
  @ApiResponse({
    status: 201,
    description: 'Position created successfully',
    type: PositionResponseDto,
  })
  async create(
    @Body() createPositionDto: CreatePositionDto,
  ): Promise<PositionResponseDto> {
    return this.positionService.create(createPositionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all positions' })
  @ApiQuery({
    name: 'portfolioId',
    required: false,
    description: 'Filter by portfolio ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (active/closed)',
    enum: ['active', 'closed'],
  })
  @ApiResponse({
    status: 200,
    description: 'List of positions',
    type: [PositionResponseDto],
  })
  async findAll(
    @Query('portfolioId') portfolioId?: string,
    @Query('status') status?: 'active' | 'closed',
  ): Promise<PositionResponseDto[]> {
    if (portfolioId) {
      if (status === 'active') {
        return this.positionService.findActivePositions(portfolioId);
      } else if (status === 'closed') {
        return this.positionService.findClosedPositions(portfolioId);
      }
      return this.positionService.findByPortfolioId(portfolioId);
    }
    return this.positionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get position by ID' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiResponse({
    status: 200,
    description: 'Position found',
    type: PositionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async findOne(@Param('id') id: string): Promise<PositionResponseDto> {
    return this.positionService.findOne(id);
  }

  @Get('portfolio/:portfolioId')
  @ApiOperation({ summary: 'Get positions by portfolio ID' })
  @ApiParam({ name: 'portfolioId', description: 'Portfolio ID' })
  @ApiResponse({
    status: 200,
    description: 'Portfolio positions found',
    type: [PositionResponseDto],
  })
  async findByPortfolioId(
    @Param('portfolioId') portfolioId: string,
  ): Promise<PositionResponseDto[]> {
    return this.positionService.findByPortfolioId(portfolioId);
  }

  @Get('portfolio/:portfolioId/active')
  @ApiOperation({ summary: 'Get active positions by portfolio ID' })
  @ApiParam({ name: 'portfolioId', description: 'Portfolio ID' })
  @ApiResponse({
    status: 200,
    description: 'Active positions found',
    type: [PositionResponseDto],
  })
  async findActivePositions(
    @Param('portfolioId') portfolioId: string,
  ): Promise<PositionResponseDto[]> {
    return this.positionService.findActivePositions(portfolioId);
  }

  @Get('portfolio/:portfolioId/closed')
  @ApiOperation({ summary: 'Get closed positions by portfolio ID' })
  @ApiParam({ name: 'portfolioId', description: 'Portfolio ID' })
  @ApiResponse({
    status: 200,
    description: 'Closed positions found',
    type: [PositionResponseDto],
  })
  async findClosedPositions(
    @Param('portfolioId') portfolioId: string,
  ): Promise<PositionResponseDto[]> {
    return this.positionService.findClosedPositions(portfolioId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update position' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiBody({ type: UpdatePositionDto })
  @ApiResponse({
    status: 200,
    description: 'Position updated successfully',
    type: PositionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePositionDto: UpdatePositionDto,
  ): Promise<PositionResponseDto> {
    return this.positionService.update(id, updatePositionDto);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close position with realized PnL' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pnlRealized: { type: 'number', description: 'Realized profit/loss' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Position closed successfully',
    type: PositionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async closePosition(
    @Param('id') id: string,
    @Body('pnlRealized') pnlRealized: number,
  ): Promise<PositionResponseDto> {
    return this.positionService.closePosition(id, pnlRealized);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete position' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiResponse({ status: 204, description: 'Position deleted successfully' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.positionService.remove(id);
  }
}
