import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({
    example: 'My Resource Title',
    description: 'Title of the resource',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'This is the content of my resource',
    description: 'Content of the resource',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
} 