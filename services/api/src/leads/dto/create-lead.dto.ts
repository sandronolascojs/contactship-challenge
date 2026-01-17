import { LeadSource, LeadStatus } from '@contactship/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AddressDto {
  @ApiProperty({ description: 'Street address', example: '123 Main St' })
  street: string;

  @ApiProperty({ description: 'City name', example: 'New York' })
  city: string;

  @ApiProperty({ description: 'State or province', example: 'NY' })
  state: string;

  @ApiProperty({ description: 'Postal code', example: '10001' })
  postcode: string;

  @ApiProperty({ description: 'Country name', example: 'United States' })
  country: string;
}

export class CreateLeadDto {
  @ApiProperty({
    description: 'Lead first name',
    example: 'John',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  firstName: string;

  @ApiProperty({
    description: 'Lead last name',
    example: 'Doe',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  lastName: string;

  @ApiProperty({
    description: 'Lead email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Lead phone number',
    example: '+1234567890',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'External system ID',
    example: 'EXT-12345',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  externalId?: string;

  @ApiPropertyOptional({
    description: 'Lead address',
    type: AddressDto,
  })
  @IsObject()
  @IsOptional()
  address?: AddressDto;

  @ApiPropertyOptional({
    description: 'Lead date of birth (ISO 8601 format)',
    example: '1990-01-01',
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Lead nationality',
    example: 'US',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  nationality?: string;

  @ApiPropertyOptional({
    description: 'Lead gender',
    example: 'male',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({
    description: 'URL to lead profile picture',
    example: 'https://example.com/photo.jpg',
  })
  @IsString()
  @IsOptional()
  pictureUrl?: string;

  @ApiPropertyOptional({
    description: 'Lead source',
    enum: LeadSource,
    example: LeadSource.MANUAL,
  })
  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @ApiPropertyOptional({
    description: 'Lead status',
    enum: LeadStatus,
    example: LeadStatus.NEW,
  })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiPropertyOptional({
    description: 'Additional metadata as key-value pairs',
    example: { referral: 'friend', campaign: 'spring-sale' },
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
