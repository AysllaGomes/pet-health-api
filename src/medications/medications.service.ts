import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

@Injectable()
export class MedicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMedicationDto) {
    const petExists = await this.prisma.pet.findUnique({
      where: { id: dto.petId },
    });

    if (!petExists) {
      throw new NotFoundException('Pet não encontrado.');
    }

    return this.prisma.medication.create({
      data: {
        petId: dto.petId,
        name: dto.name,
        dosage: dto.dosage,
        frequency: dto.frequency,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        time: dto.time,
        notes: dto.notes,
        reminderMinutesBefore: dto.reminderMinutesBefore ?? 60,
      },
    });
  }

  async findAll() {
    return this.prisma.medication.findMany({
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const medication = await this.prisma.medication.findUnique({
      where: { id },
      include: {
        pet: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!medication) {
      throw new NotFoundException('Medicamento não encontrado.');
    }

    return medication;
  }

  async update(id: string, dto: UpdateMedicationDto) {
    await this.findOne(id);

    return this.prisma.medication.update({
      where: { id },
      data: {
        petId: dto.petId,
        name: dto.name,
        dosage: dto.dosage,
        frequency: dto.frequency,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        time: dto.time,
        notes: dto.notes,
        reminderMinutesBefore: dto.reminderMinutesBefore,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.medication.delete({
      where: { id },
    });
  }
}
