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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { GameOptionsService } from './game-options.service';
import {
  CreateGameOptionsDto,
  UpdateGameOptionsDto,
  GameOptionsResponseDto,
} from './dto/game-options.dto';

@ApiTags('Game Options')
@Controller('game-options')
export class GameOptionsController {
  constructor(private readonly gameOptionsService: GameOptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new game options' })
  @ApiBody({ type: CreateGameOptionsDto })
  @ApiResponse({
    status: 201,
    description: 'Game options created successfully',
    type: GameOptionsResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Game options already exist for this user',
  })
  async create(
    @Body() createGameOptionsDto: CreateGameOptionsDto,
  ): Promise<GameOptionsResponseDto> {
    return this.gameOptionsService.create(createGameOptionsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all game options' })
  @ApiResponse({
    status: 200,
    description: 'List of all game options',
    type: [GameOptionsResponseDto],
  })
  async findAll(): Promise<GameOptionsResponseDto[]> {
    return this.gameOptionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game options by ID' })
  @ApiParam({ name: 'id', description: 'Game options ID' })
  @ApiResponse({
    status: 200,
    description: 'Game options found',
    type: GameOptionsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Game options not found' })
  async findOne(@Param('id') id: string): Promise<GameOptionsResponseDto> {
    return this.gameOptionsService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get game options by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Game options found',
    type: GameOptionsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Game options not found for this user',
  })
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<GameOptionsResponseDto> {
    return this.gameOptionsService.findByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update game options by ID' })
  @ApiParam({ name: 'id', description: 'Game options ID' })
  @ApiBody({ type: UpdateGameOptionsDto })
  @ApiResponse({
    status: 200,
    description: 'Game options updated successfully',
    type: GameOptionsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Game options not found' })
  async update(
    @Param('id') id: string,
    @Body() updateGameOptionsDto: UpdateGameOptionsDto,
  ): Promise<GameOptionsResponseDto> {
    return this.gameOptionsService.update(id, updateGameOptionsDto);
  }

  @Patch('user/:userId')
  @ApiOperation({ summary: 'Update game options by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiBody({ type: UpdateGameOptionsDto })
  @ApiResponse({
    status: 200,
    description: 'Game options updated successfully',
    type: GameOptionsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Game options not found for this user',
  })
  async updateByUserId(
    @Param('userId') userId: string,
    @Body() updateGameOptionsDto: UpdateGameOptionsDto,
  ): Promise<GameOptionsResponseDto> {
    return this.gameOptionsService.updateByUserId(userId, updateGameOptionsDto);
  }

  @Post('upsert/:userId')
  @ApiOperation({ summary: 'Create or update game options for user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiBody({ type: UpdateGameOptionsDto })
  @ApiResponse({
    status: 201,
    description: 'Game options created or updated successfully',
    type: GameOptionsResponseDto,
  })
  async upsert(
    @Param('userId') userId: string,
    @Body() updateGameOptionsDto: UpdateGameOptionsDto,
  ): Promise<GameOptionsResponseDto> {
    return this.gameOptionsService.upsert(userId, updateGameOptionsDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete game options by ID' })
  @ApiParam({ name: 'id', description: 'Game options ID' })
  @ApiResponse({
    status: 204,
    description: 'Game options deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Game options not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.gameOptionsService.remove(id);
  }

  @Delete('user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete game options by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'Game options deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Game options not found for this user',
  })
  async removeByUserId(@Param('userId') userId: string): Promise<void> {
    return this.gameOptionsService.removeByUserId(userId);
  }
}
