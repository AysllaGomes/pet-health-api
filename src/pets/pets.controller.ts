import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

import * as authenticatedUserInterface from '../auth/interfaces/authenticated-user.interface';

@ApiBearerAuth('JWT-auth')
@ApiTags('pets')
@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar pet' })
  @ApiBody({ type: CreatePetDto })
  @ApiResponse({ status: 201, description: 'Pet criado com sucesso.' })
  create(
    @Body() dto: CreatePetDto,
    @CurrentUser() user: authenticatedUserInterface.AuthenticatedUser,
  ) {
    return this.petsService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pets do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de pets retornada.' })
  findAll(
    @CurrentUser() user: authenticatedUserInterface.AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.petsService.findAll(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pet por ID' })
  @ApiParam({ name: 'id', description: 'ID do pet' })
  @ApiResponse({ status: 200, description: 'Pet encontrado.' })
  @ApiResponse({ status: 404, description: 'Pet não encontrado.' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: authenticatedUserInterface.AuthenticatedUser,
  ) {
    return this.petsService.findOne(user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pet' })
  @ApiParam({ name: 'id', description: 'ID do pet' })
  @ApiBody({ type: UpdatePetDto })
  @ApiResponse({ status: 200, description: 'Pet atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pet não encontrado.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePetDto,
    @CurrentUser() user: authenticatedUserInterface.AuthenticatedUser,
  ) {
    return this.petsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover pet' })
  @ApiParam({ name: 'id', description: 'ID do pet' })
  @ApiResponse({ status: 200, description: 'Pet removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pet não encontrado.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: authenticatedUserInterface.AuthenticatedUser,
  ) {
    return this.petsService.remove(user.userId, id);
  }
}
