import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreatePetDto {
  @ApiProperty({
    example: 'Thor',
    description: 'Nome do pet',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'dog',
    description: 'Espécie do pet',
  })
  @IsNotEmpty()
  species: string;

  @ApiPropertyOptional({
    example: 'Golden Retriever',
    description: 'Raça do pet',
  })
  @IsOptional()
  breed?: string;

  @ApiPropertyOptional({
    example: '2020-05-10',
    description: 'Data de nascimento do pet',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'Peso do pet',
  })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({
    example: 'Pet alérgico a determinado medicamento',
    description: 'Observações gerais',
  })
  @IsOptional()
  notes?: string;
}
