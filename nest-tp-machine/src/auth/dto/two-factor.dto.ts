import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class TwoFactorDto {
  @ApiProperty({
    example: '123456',
    description: '6-digit two-factor authentication code',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
} 