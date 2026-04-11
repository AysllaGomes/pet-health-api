import {
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  IsEnum,
} from 'class-validator';

export enum VaccineCategoryDto {
  VACCINE = 'VACCINE',
  ANTIPARASITIC = 'ANTIPARASITIC',
  DEWORMER = 'DEWORMER',
}

export class CreateVaccineDto {
  @IsNotEmpty()
  petId: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEnum(VaccineCategoryDto)
  category?: VaccineCategoryDto;

  @IsDateString()
  applicationDate: string;

  @IsOptional()
  @IsDateString()
  nextDoseDate?: string;

  @IsOptional()
  veterinarian?: string;

  @IsOptional()
  clinic?: string;

  @IsOptional()
  notes?: string;

  @IsOptional()
  @IsInt()
  reminderDaysBefore?: number;
}
