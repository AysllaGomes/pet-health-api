import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateVaccineDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  nextDoseDate?: string;

  @IsOptional()
  @IsInt()
  reminderDaysBefore?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
