import {
  IsEmail,
  IsOptional,
  IsString,
  IsEnum,
  IsObject,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { LeadSource, LeadStatus } from '@contactship/types';

export class CreateLeadDto {
  @IsString()
  @MaxLength(255)
  firstName: string;

  @IsString()
  @MaxLength(255)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  phone?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  externalId?: string;

  @IsObject()
  @IsOptional()
  address?: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  nationality?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  pictureUrl?: string;

  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
