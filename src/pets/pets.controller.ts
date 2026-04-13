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

import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@ApiTags('pets')
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar pet' })
  @ApiBody({ type: CreatePetDto })
  @ApiResponse({ status: 201, description: 'Pet criado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  create(@Body() dto: CreatePetDto) {
    return this.petsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pets' })
  @ApiResponse({ status: 200, description: 'Lista de pets retornada.' })
  findAll() {
    return this.petsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pet por ID' })
  @ApiParam({ name: 'id', description: 'ID do pet' })
  @ApiResponse({ status: 200, description: 'Pet encontrado.' })
  @ApiResponse({ status: 404, description: 'Pet não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pet' })
  @ApiParam({ name: 'id', description: 'ID do pet' })
  @ApiBody({ type: UpdatePetDto })
  @ApiResponse({ status: 200, description: 'Pet atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pet não encontrado.' })
  update(@Param('id') id: string, @Body() dto: UpdatePetDto) {
    return this.petsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover pet' })
  @ApiParam({ name: 'id', description: 'ID do pet' })
  @ApiResponse({ status: 200, description: 'Pet removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pet não encontrado.' })
  remove(@Param('id') id: string) {
    return this.petsService.remove(id);
  }
}
