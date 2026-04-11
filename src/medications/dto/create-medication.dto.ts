import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Matches,
  Min,
} from 'class-validator';

export class CreateMedicationDto {
  @ApiProperty({
    example: 'uuid-do-pet',
    description: 'ID do pet',
  })
  @IsNotEmpty()
  petId: string;

  @ApiProperty({
    example: 'Prednisona',
    description: 'Nome do medicamento',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '1 comprimido',
    description: 'Dosagem do medicamento',
  })
  @IsNotEmpty()
  dosage: string;

  @ApiProperty({
    example: '1x ao dia',
    description: 'Frequência de uso',
  })
  @IsNotEmpty()
  frequency: string;

  @ApiProperty({
    example: '2026-04-11',
    description: 'Data de início do tratamento',
  })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({
    example: '2026-04-20',
    description: 'Data de término do tratamento',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: '08:00',
    description: 'Horário do medicamento no formato HH:mm',
  })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'time deve estar no formato HH:mm',
  })
  time?: string;

  @ApiPropertyOptional({
    example: 'Dar junto com alimento',
    description: 'Observações',
  })
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'Minutos antes para enviar lembrete',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  reminderMinutesBefore?: number;
}
