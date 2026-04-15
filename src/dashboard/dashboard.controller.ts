import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { DashboardResponse } from './interfaces/dashboard-response.interface';
import * as authenticatedUserInterface from '../auth/interfaces/authenticated-user.interface';

@ApiBearerAuth('JWT-auth')
@ApiTags('dashboard')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Retornar visão geral do dashboard do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard retornado com sucesso.',
  })
  findOne(
    @CurrentUser() user: authenticatedUserInterface.AuthenticatedUser,
  ): Promise<DashboardResponse> {
    return this.dashboardService.getDashboard(user.userId);
  }
}
