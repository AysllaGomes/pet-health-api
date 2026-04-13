import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

enum NotificationStatusDto {
  SENT = 'SENT',
  FAILED = 'FAILED',
}

enum NotificationTypeDto {
  MEDICATION = 'MEDICATION',
  VACCINE_DEFAULT = 'VACCINE_DEFAULT',
  VACCINE_BUY = 'VACCINE_BUY',
  VACCINE_APPLY = 'VACCINE_APPLY',
}

export class QueryNotificationsDto {
  @ApiPropertyOptional({
    enum: NotificationStatusDto,
    description: 'Filtrar por status da notificação',
  })
  @IsOptional()
  @IsEnum(NotificationStatusDto)
  status?: NotificationStatusDto;

  @ApiPropertyOptional({
    enum: NotificationTypeDto,
    description: 'Filtrar por tipo da notificação',
  })
  @IsOptional()
  @IsEnum(NotificationTypeDto)
  type?: NotificationTypeDto;

  @ApiPropertyOptional({
    example: 'uuid-do-pet',
    description: 'Filtrar por ID do pet',
  })
  @IsOptional()
  @IsString()
  petId?: string;
}
