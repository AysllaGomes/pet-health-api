import {
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class CreatePetDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  species: string;

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
