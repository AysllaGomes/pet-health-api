import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { VaccinesService } from './vaccines.service';
import { CreateVaccineDto } from './dto/create-vaccine.dto';

@ApiTags('vaccines')
@Controller('vaccines')
export class VaccinesController {
  constructor(private readonly vaccinesService: VaccinesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar vacina ou tratamento' })
  @ApiBody({ type: CreateVaccineDto })
  @ApiResponse({
    status: 201,
    description: 'Vacina ou tratamento criado com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Pet não encontrado.' })
  create(@Body() dto: CreateVaccineDto) {
    return this.vaccinesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar vacinas e tratamentos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de vacinas e tratamentos retornada.',
  })
  findAll() {
    return this.vaccinesService.findAll();
  }
}
