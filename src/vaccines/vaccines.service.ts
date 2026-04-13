import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateVaccineDto } from './dto/create-vaccine.dto';
import { VaccineCategoryDto } from './dto/create-vaccine.dto';

@Injectable()
export class VaccinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateVaccineDto) {
    const petExists = await this.prisma.pet.findFirst({
      where: {
        id: dto.petId,
        userId,
      },
    });

    if (!petExists) {
      throw new NotFoundException('Pet não encontrado.');
    }

    return this.prisma.vaccine.create({
      data: {
        petId: dto.petId,
        name: dto.name,
        category: dto.category ?? VaccineCategoryDto.VACCINE,
        applicationDate: new Date(dto.applicationDate),
        nextDoseDate: dto.nextDoseDate ? new Date(dto.nextDoseDate) : undefined,
        veterinarian: dto.veterinarian,
        clinic: dto.clinic,
        notes: dto.notes,
        reminderDaysBefore: dto.reminderDaysBefore ?? 7,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.vaccine.findMany({
      where: {
        pet: {
          userId,
        },
      },
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
