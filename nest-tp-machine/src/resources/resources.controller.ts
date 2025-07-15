import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { CreateResourceDto, UpdateResourceDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifiedGuard } from '../auth/guards/verified.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get('public')
  @ApiOperation({ summary: 'Get public resources (accessible without authentication)' })
  @ApiResponse({ status: 200, description: 'Public resources retrieved successfully' })
  getPublicResources() {
    return {
      message: 'This is a public endpoint accessible without authentication',
      data: [
        { id: 1, title: 'Public Resource 1', content: 'This is public content' },
        { id: 2, title: 'Public Resource 2', content: 'This is also public content' },
      ],
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, VerifiedGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new resource (private)' })
  @ApiResponse({ status: 201, description: 'Resource created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createResourceDto: CreateResourceDto, @CurrentUser() user: any) {
    return this.resourcesService.create(createResourceDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, VerifiedGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user resources (private)' })
  @ApiResponse({ status: 200, description: 'User resources retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user: any) {
    return this.resourcesService.findAll(user.id);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, VerifiedGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all resources (admin only)' })
  @ApiResponse({ status: 200, description: 'All resources retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  findAllForAdmin() {
    return this.resourcesService.findAllForAdmin();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, VerifiedGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get specific resource (private)' })
  @ApiResponse({ status: 200, description: 'Resource retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.resourcesService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, VerifiedGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update resource (private)' })
  @ApiResponse({ status: 200, description: 'Resource updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateResourceDto: UpdateResourceDto,
    @CurrentUser() user: any,
  ) {
    return this.resourcesService.update(id, updateResourceDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, VerifiedGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete resource (private)' })
  @ApiResponse({ status: 200, description: 'Resource deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.resourcesService.remove(id, user.id);
  }
}
 