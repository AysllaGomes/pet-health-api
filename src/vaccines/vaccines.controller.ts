import { Body, Controller, Get, Post } from '@nestjs/common';

import { VaccinesService } from './vaccines.service';

import { CreateVaccineDto } from './dto/create-vaccine.dto';

@Controller('vaccines')
export class VaccinesController {
  constructor(private readonly vaccinesService: VaccinesService) {}

  @Post()
  create(@Body() dto: CreateVaccineDto) {
    return this.vaccinesService.create(dto);
  }

  @Get()
  findAll() {
    return this.vaccinesService.findAll();
  }
}
