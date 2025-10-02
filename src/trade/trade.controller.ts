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
import { TradeService } from './trade.service';
import {
  CreateTradeDto,
  UpdateTradeDto,
  TradeResponseDto,
} from './dto/trade.dto';
import { TradeStatus } from '@prisma/client';

@ApiTags('Trades')
@Controller('trades')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trade' })
  @ApiBody({ type: CreateTradeDto })
  @ApiResponse({
    status: 201,
    description: 'Trade created successfully',
    type: TradeResponseDto,
  })
  async create(
    @Body() createTradeDto: CreateTradeDto,
  ): Promise<TradeResponseDto> {
    return this.tradeService.create(createTradeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trades' })
  @ApiQuery({
    name: 'portfolioId',
    required: false,
    description: 'Filter by portfolio ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by trade status',
    enum: TradeStatus,
  })
  @ApiResponse({
    status: 200,
    description: 'List of trades',
    type: [TradeResponseDto],
  })
  async findAll(
    @Query('portfolioId') portfolioId?: string,
    @Query('status') status?: TradeStatus,
  ): Promise<TradeResponseDto[]> {
    if (portfolioId && status) {
      return this.tradeService.findByStatus(status);
    } else if (portfolioId) {
      return this.tradeService.findByPortfolioId(portfolioId);
    } else if (status) {
      return this.tradeService.findByStatus(status);
    }
    return this.tradeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trade by ID' })
  @ApiParam({ name: 'id', description: 'Trade ID' })
  @ApiResponse({
    status: 200,
    description: 'Trade found',
    type: TradeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Trade not found' })
  async findOne(@Param('id') id: string): Promise<TradeResponseDto> {
    return this.tradeService.findOne(id);
  }

  @Get('portfolio/:portfolioId')
  @ApiOperation({ summary: 'Get trades by portfolio ID' })
  @ApiParam({ name: 'portfolioId', description: 'Portfolio ID' })
  @ApiResponse({
    status: 200,
    description: 'Portfolio trades found',
    type: [TradeResponseDto],
  })
  async findByPortfolioId(
    @Param('portfolioId') portfolioId: string,
  ): Promise<TradeResponseDto[]> {
    return this.tradeService.findByPortfolioId(portfolioId);
  }

  @Get('portfolio/:portfolioId/pending')
  @ApiOperation({ summary: 'Get pending trades by portfolio ID' })
  @ApiParam({ name: 'portfolioId', description: 'Portfolio ID' })
  @ApiResponse({
    status: 200,
    description: 'Pending trades found',
    type: [TradeResponseDto],
  })
  async findPendingTrades(
    @Param('portfolioId') portfolioId: string,
  ): Promise<TradeResponseDto[]> {
    return this.tradeService.findPendingTrades(portfolioId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get trades by status' })
  @ApiParam({ name: 'status', description: 'Trade status', enum: TradeStatus })
  @ApiResponse({
    status: 200,
    description: 'Trades found',
    type: [TradeResponseDto],
  })
  async findByStatus(
    @Param('status') status: TradeStatus,
  ): Promise<TradeResponseDto[]> {
    return this.tradeService.findByStatus(status);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update trade' })
  @ApiParam({ name: 'id', description: 'Trade ID' })
  @ApiBody({ type: UpdateTradeDto })
  @ApiResponse({
    status: 200,
    description: 'Trade updated successfully',
    type: TradeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Trade not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTradeDto: UpdateTradeDto,
  ): Promise<TradeResponseDto> {
    return this.tradeService.update(id, updateTradeDto);
  }

  @Patch(':id/fill')
  @ApiOperation({ summary: 'Fill trade with price' })
  @ApiParam({ name: 'id', description: 'Trade ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        price: { type: 'number', description: 'Fill price' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Trade filled successfully',
    type: TradeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Trade not found' })
  async fillTrade(
    @Param('id') id: string,
    @Body('price') price: number,
  ): Promise<TradeResponseDto> {
    return this.tradeService.fillTrade(id, price);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel trade' })
  @ApiParam({ name: 'id', description: 'Trade ID' })
  @ApiResponse({
    status: 200,
    description: 'Trade cancelled successfully',
    type: TradeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Trade not found' })
  async cancelTrade(@Param('id') id: string): Promise<TradeResponseDto> {
    return this.tradeService.cancelTrade(id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject trade with reason' })
  @ApiParam({ name: 'id', description: 'Trade ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rejectionReason: { type: 'string', description: 'Rejection reason' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Trade rejected successfully',
    type: TradeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Trade not found' })
  async rejectTrade(
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason: string,
  ): Promise<TradeResponseDto> {
    return this.tradeService.rejectTrade(id, rejectionReason);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete trade' })
  @ApiParam({ name: 'id', description: 'Trade ID' })
  @ApiResponse({ status: 204, description: 'Trade deleted successfully' })
  @ApiResponse({ status: 404, description: 'Trade not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.tradeService.remove(id);
  }
}
