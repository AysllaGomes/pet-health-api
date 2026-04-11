import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { MedicationsService } from './medications.service';

import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

@ApiTags('medications')
@Controller('medications')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar medicamento controlado' })
  @ApiBody({ type: CreateMedicationDto })
  @ApiResponse({ status: 201, description: 'Medicamento criado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pet não encontrado.' })
  create(@Body() dto: CreateMedicationDto) {
    return this.medicationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar medicamentos' })
  @ApiResponse({ status: 200, description: 'Lista de medicamentos retornada.' })
  findAll() {
    return this.medicationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar medicamento por ID' })
  @ApiParam({ name: 'id', description: 'ID do medicamento' })
  @ApiResponse({ status: 200, description: 'Medicamento encontrado.' })
  @ApiResponse({ status: 404, description: 'Medicamento não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.medicationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar medicamento' })
  @ApiParam({ name: 'id', description: 'ID do medicamento' })
  @ApiBody({ type: UpdateMedicationDto })
  @ApiResponse({
    status: 200,
    description: 'Medicamento atualizado com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Medicamento não encontrado.' })
  update(@Param('id') id: string, @Body() dto: UpdateMedicationDto) {
    return this.medicationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover medicamento' })
  @ApiParam({ name: 'id', description: 'ID do medicamento' })
  @ApiResponse({
    status: 200,
    description: 'Medicamento removido com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Medicamento não encontrado.' })
  remove(@Param('id') id: string) {
    return this.medicationsService.remove(id);
  }
}
