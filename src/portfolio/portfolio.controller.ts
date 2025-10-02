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
import { PortfolioService } from './portfolio.service';
import {
  CreatePortfolioDto,
  UpdatePortfolioDto,
  PortfolioResponseDto,
} from './dto/portfolio.dto';

@ApiTags('Portfolios')
@Controller('portfolios')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new portfolio' })
  @ApiBody({ type: CreatePortfolioDto })
  @ApiResponse({
    status: 201,
    description: 'Portfolio created successfully',
    type: PortfolioResponseDto,
  })
  async create(
    @Body() createPortfolioDto: CreatePortfolioDto,
  ): Promise<PortfolioResponseDto> {
    return this.portfolioService.create(createPortfolioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all portfolios' })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of portfolios',
    type: [PortfolioResponseDto],
  })
  async findAll(
    @Query('userId') userId?: string,
  ): Promise<PortfolioResponseDto[]> {
    if (userId) {
      return this.portfolioService.findByUserId(userId);
    }
    return this.portfolioService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get portfolio by ID' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiResponse({
    status: 200,
    description: 'Portfolio found',
    type: PortfolioResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Portfolio not found' })
  async findOne(@Param('id') id: string): Promise<PortfolioResponseDto> {
    return this.portfolioService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get portfolios by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User portfolios found',
    type: [PortfolioResponseDto],
  })
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<PortfolioResponseDto[]> {
    return this.portfolioService.findByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update portfolio' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiBody({ type: UpdatePortfolioDto })
  @ApiResponse({
    status: 200,
    description: 'Portfolio updated successfully',
    type: PortfolioResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Portfolio not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
  ): Promise<PortfolioResponseDto> {
    return this.portfolioService.update(id, updatePortfolioDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete portfolio' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiResponse({ status: 204, description: 'Portfolio deleted successfully' })
  @ApiResponse({ status: 404, description: 'Portfolio not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.portfolioService.remove(id);
  }
}
