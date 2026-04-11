import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export enum VaccineCategoryDto {
  VACCINE = 'VACCINE',
  ANTIPARASITIC = 'ANTIPARASITIC',
  DEWORMER = 'DEWORMER',
}

export class CreateVaccineDto {
  @ApiProperty({
    example: 'uuid-do-pet',
    description: 'ID do pet',
  })
  @IsNotEmpty()
  petId: string;

  @ApiProperty({
    example: 'Vacina Anual',
    description: 'Nome da vacina ou tratamento',
  })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    enum: VaccineCategoryDto,
    example: VaccineCategoryDto.VACCINE,
    description: 'Categoria da vacina ou tratamento',
  })
  @IsOptional()
  @IsEnum(VaccineCategoryDto)
  category?: VaccineCategoryDto;

  @ApiProperty({
    example: '2026-04-11',
    description: 'Data de aplicação',
  })
  @IsDateString()
  applicationDate: string;

  @ApiPropertyOptional({
    example: '2027-04-11',
    description: 'Data da próxima dose',
  })
  @IsOptional()
  @IsDateString()
  nextDoseDate?: string;

  @ApiPropertyOptional({
    example: 'Dra. Ana',
    description: 'Nome do veterinário',
  })
  @IsOptional()
  veterinarian?: string;

  @ApiPropertyOptional({
    example: 'Clínica Pet Feliz',
    description: 'Nome da clínica',
  })
  @IsOptional()
  clinic?: string;

  @ApiPropertyOptional({
    example: 'Aplicação sem intercorrências',
    description: 'Observações',
  })
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    example: 7,
    description: 'Quantidade de dias antes para lembrete padrão',
  })
  @IsOptional()
  @IsInt()
  reminderDaysBefore?: number;
}
