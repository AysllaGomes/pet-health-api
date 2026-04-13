import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { HealthService } from './health.service';
import { HealthcheckResponse } from './interfaces/healthcheck-response.interface';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar saúde da aplicação' })
  @ApiResponse({
    status: 200,
    description: 'Status da aplicação retornado com sucesso.',
  })
  async check(): Promise<HealthcheckResponse> {
    return this.healthService.check();
  }
}
