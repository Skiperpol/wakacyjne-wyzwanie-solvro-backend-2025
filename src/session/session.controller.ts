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
import { SessionService } from './session.service';
import {
  CreateSessionDto,
  UpdateSessionDto,
  SessionResponseDto,
} from './dto/session.dto';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new session' })
  @ApiBody({ type: CreateSessionDto })
  @ApiResponse({
    status: 201,
    description: 'Session created successfully',
    type: SessionResponseDto,
  })
  async create(
    @Body() createSessionDto: CreateSessionDto,
  ): Promise<SessionResponseDto> {
    return this.sessionService.create(createSessionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sessions' })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of sessions',
    type: [SessionResponseDto],
  })
  async findAll(
    @Query('userId') userId?: string,
  ): Promise<SessionResponseDto[]> {
    if (userId) {
      return this.sessionService.findByUserId(userId);
    }
    return this.sessionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session by ID' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({
    status: 200,
    description: 'Session found',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async findOne(@Param('id') id: string): Promise<SessionResponseDto> {
    return this.sessionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiBody({ type: UpdateSessionDto })
  @ApiResponse({
    status: 200,
    description: 'Session updated successfully',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ): Promise<SessionResponseDto> {
    return this.sessionService.update(id, updateSessionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 204, description: 'Session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.sessionService.remove(id);
  }

  @Delete('user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete all sessions for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'All user sessions deleted successfully',
  })
  async removeByUserId(@Param('userId') userId: string): Promise<void> {
    return this.sessionService.removeByUserId(userId);
  }

  @Delete('cleanup/expired')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove expired sessions' })
  @ApiResponse({
    status: 204,
    description: 'Expired sessions removed successfully',
  })
  async removeExpired(): Promise<void> {
    return this.sessionService.removeExpired();
  }
}
