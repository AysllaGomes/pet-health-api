import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { MedicationsService } from './medications.service';

import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as authenticatedUserInterface from '../auth/interfaces/authenticated-user.interface';

@ApiBearerAuth('JWT-auth')
@ApiTags('medications')
@UseGuards(JwtAuthGuard)
@Controller('medications')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar medicamento controlado' })
  @ApiBody({ type: CreateMedicationDto })
  @ApiResponse({ status: 201, description: 'Medicamento criado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pet não encontrado.' })
  create(
    @Body() dto: CreateMedicationDto,
    @CurrentUser() user: authenticatedUserInterface.AuthenticatedUser,
  ) {
    return this.medicationsService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar medicamentos do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de medicamentos retornada.' })
  findAll(@CurrentUser() user: authenticatedUserInterface.AuthenticatedUser) {
    return this.medicationsService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar medicamento por ID' })
  @ApiParam({ name: 'id', description: 'ID do medicamento' })
  @ApiResponse({ status: 200, description: 'Medicamento encontrado.' })
  @ApiResponse({ status: 404, description: 'Medicamento não encontrado.' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: authenticatedUserInterface.AuthenticatedUser,
  ) {
    return this.medicationsService.findOne(user.userId, id);
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
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicationDto,
    @CurrentUser() user: authenticatedUserInterface.AuthenticatedUser,
  ) {
    return this.medicationsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover medicamento' })
  @ApiParam({ name: 'id', description: 'ID do medicamento' })
  @ApiResponse({
    status: 200,
    description: 'Medicamento removido com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Medicamento não encontrado.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: authenticatedUserInterface.AuthenticatedUser,
  ) {
    return this.medicationsService.remove(user.userId, id);
  }
}
