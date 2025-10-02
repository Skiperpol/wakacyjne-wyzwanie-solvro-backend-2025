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
import { WatchlistService } from './watchlist.service';
import {
  CreateWatchlistDto,
  UpdateWatchlistDto,
  WatchlistResponseDto,
  CreateWatchlistItemDto,
  UpdateWatchlistItemDto,
  WatchlistItemResponseDto,
} from './dto/watchlist.dto';

@ApiTags('Watchlists')
@Controller('watchlists')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  // Watchlist endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new watchlist' })
  @ApiBody({ type: CreateWatchlistDto })
  @ApiResponse({
    status: 201,
    description: 'Watchlist created successfully',
    type: WatchlistResponseDto,
  })
  async createWatchlist(
    @Body() createWatchlistDto: CreateWatchlistDto,
  ): Promise<WatchlistResponseDto> {
    return this.watchlistService.createWatchlist(createWatchlistDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all watchlists' })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of watchlists',
    type: [WatchlistResponseDto],
  })
  async findAllWatchlists(
    @Query('userId') userId?: string,
  ): Promise<WatchlistResponseDto[]> {
    if (userId) {
      return this.watchlistService.findWatchlistsByUserId(userId);
    }
    return this.watchlistService.findAllWatchlists();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get watchlist by ID' })
  @ApiParam({ name: 'id', description: 'Watchlist ID' })
  @ApiResponse({
    status: 200,
    description: 'Watchlist found',
    type: WatchlistResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Watchlist not found' })
  async findWatchlistById(
    @Param('id') id: string,
  ): Promise<WatchlistResponseDto> {
    return this.watchlistService.findWatchlistById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get watchlists by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User watchlists found',
    type: [WatchlistResponseDto],
  })
  async findWatchlistsByUserId(
    @Param('userId') userId: string,
  ): Promise<WatchlistResponseDto[]> {
    return this.watchlistService.findWatchlistsByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update watchlist' })
  @ApiParam({ name: 'id', description: 'Watchlist ID' })
  @ApiBody({ type: UpdateWatchlistDto })
  @ApiResponse({
    status: 200,
    description: 'Watchlist updated successfully',
    type: WatchlistResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Watchlist not found' })
  async updateWatchlist(
    @Param('id') id: string,
    @Body() updateWatchlistDto: UpdateWatchlistDto,
  ): Promise<WatchlistResponseDto> {
    return this.watchlistService.updateWatchlist(id, updateWatchlistDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete watchlist' })
  @ApiParam({ name: 'id', description: 'Watchlist ID' })
  @ApiResponse({ status: 204, description: 'Watchlist deleted successfully' })
  @ApiResponse({ status: 404, description: 'Watchlist not found' })
  async removeWatchlist(@Param('id') id: string): Promise<void> {
    return this.watchlistService.removeWatchlist(id);
  }

  // WatchlistItem endpoints
  @Post('items')
  @ApiOperation({ summary: 'Create a new watchlist item' })
  @ApiBody({ type: CreateWatchlistItemDto })
  @ApiResponse({
    status: 201,
    description: 'Watchlist item created successfully',
    type: WatchlistItemResponseDto,
  })
  async createWatchlistItem(
    @Body() createWatchlistItemDto: CreateWatchlistItemDto,
  ): Promise<WatchlistItemResponseDto> {
    return this.watchlistService.createWatchlistItem(createWatchlistItemDto);
  }

  @Get('items')
  @ApiOperation({ summary: 'Get all watchlist items' })
  @ApiQuery({
    name: 'watchlistId',
    required: false,
    description: 'Filter by watchlist ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of watchlist items',
    type: [WatchlistItemResponseDto],
  })
  async findAllWatchlistItems(
    @Query('watchlistId') watchlistId?: string,
  ): Promise<WatchlistItemResponseDto[]> {
    if (watchlistId) {
      return this.watchlistService.findWatchlistItemsByWatchlistId(watchlistId);
    }
    return this.watchlistService.findAllWatchlistItems();
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get watchlist item by ID' })
  @ApiParam({ name: 'id', description: 'Watchlist item ID' })
  @ApiResponse({
    status: 200,
    description: 'Watchlist item found',
    type: WatchlistItemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Watchlist item not found' })
  async findWatchlistItemById(
    @Param('id') id: string,
  ): Promise<WatchlistItemResponseDto> {
    return this.watchlistService.findWatchlistItemById(id);
  }

  @Get(':watchlistId/items')
  @ApiOperation({ summary: 'Get watchlist items by watchlist ID' })
  @ApiParam({ name: 'watchlistId', description: 'Watchlist ID' })
  @ApiResponse({
    status: 200,
    description: 'Watchlist items found',
    type: [WatchlistItemResponseDto],
  })
  async findWatchlistItemsByWatchlistId(
    @Param('watchlistId') watchlistId: string,
  ): Promise<WatchlistItemResponseDto[]> {
    return this.watchlistService.findWatchlistItemsByWatchlistId(watchlistId);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update watchlist item' })
  @ApiParam({ name: 'id', description: 'Watchlist item ID' })
  @ApiBody({ type: UpdateWatchlistItemDto })
  @ApiResponse({
    status: 200,
    description: 'Watchlist item updated successfully',
    type: WatchlistItemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Watchlist item not found' })
  async updateWatchlistItem(
    @Param('id') id: string,
    @Body() updateWatchlistItemDto: UpdateWatchlistItemDto,
  ): Promise<WatchlistItemResponseDto> {
    return this.watchlistService.updateWatchlistItem(
      id,
      updateWatchlistItemDto,
    );
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete watchlist item' })
  @ApiParam({ name: 'id', description: 'Watchlist item ID' })
  @ApiResponse({
    status: 204,
    description: 'Watchlist item deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Watchlist item not found' })
  async removeWatchlistItem(@Param('id') id: string): Promise<void> {
    return this.watchlistService.removeWatchlistItem(id);
  }

  @Delete(':watchlistId/items')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete all items from watchlist' })
  @ApiParam({ name: 'watchlistId', description: 'Watchlist ID' })
  @ApiResponse({
    status: 204,
    description: 'All watchlist items deleted successfully',
  })
  async removeAllWatchlistItems(
    @Param('watchlistId') watchlistId: string,
  ): Promise<void> {
    return this.watchlistService.removeAllWatchlistItems(watchlistId);
  }
}
