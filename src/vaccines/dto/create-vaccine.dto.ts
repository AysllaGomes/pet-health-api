import { IsNotEmpty, IsOptional, IsDateString, IsInt } from 'class-validator';

export class CreateVaccineDto {
  @IsNotEmpty()
  petId: string;

  @IsNotEmpty()
  name: string;

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
