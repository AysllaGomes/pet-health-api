import { IsOptional, IsDateString, IsNumber } from 'class-validator';

export class UpdatePetDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  species?: string;

  @IsOptional()
  breed?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  notes?: string;
}
