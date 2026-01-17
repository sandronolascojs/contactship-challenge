import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateSummaryDto {
  @IsString()
  @IsNotEmpty()
  leadId: string;
}
