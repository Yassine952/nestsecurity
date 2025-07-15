import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateResourceDto {
  @ApiProperty({
    example: 'Updated Resource Title',
    description: 'Title of the resource',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'Updated content of my resource',
    description: 'Content of the resource',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the resource is active',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 