import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateVaccineDto } from './dto/create-vaccine.dto';

@Injectable()
export class VaccinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVaccineDto) {
    const petExists = await this.prisma.pet.findUnique({
      where: { id: dto.petId },
    });

    if (!petExists) {
      throw new NotFoundException('Pet não encontrado.');
    }

    return this.prisma.vaccine.create({
      data: {
        ...dto,
        applicationDate: new Date(dto.applicationDate),
        nextDoseDate: dto.nextDoseDate ? new Date(dto.nextDoseDate) : undefined,
        reminderDaysBefore: dto.reminderDaysBefore ?? 7,
      },
    });
  }

  async findAll() {
    return this.prisma.vaccine.findMany({
      include: {
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { applicationDate: 'desc' },
    });
  }
}
