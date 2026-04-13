import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { VaccinesService } from './vaccines.service';

import { CreateVaccineDto } from './dto/create-vaccine.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as authenticatedUserInterface from '../auth/interfaces/authenticated-user.interface';

@ApiBearerAuth('JWT-auth')
@ApiTags('vaccines')
@UseGuards(JwtAuthGuard)
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
  create(
    @Body() dto: CreateVaccineDto,
    @CurrentUser() user: authenticatedUserInterface.AuthenticatedUser,
  ) {
    return this.vaccinesService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar vacinas e tratamentos do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de vacinas e tratamentos retornada.',
  })
  findAll(@CurrentUser() user: authenticatedUserInterface.AuthenticatedUser) {
    return this.vaccinesService.findAll(user.userId);
  }
}
