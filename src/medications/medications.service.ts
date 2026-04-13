import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class MedicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateMedicationDto) {
    const petExists = await this.prisma.pet.findFirst({
      where: {
        id: dto.petId,
        userId,
      },
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

  async findAll(userId: string, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      pet: {
        userId,
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.medication.findMany({
        where,
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
        skip,
        take: limit,
      }),
      this.prisma.medication.count({
        where,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const medication = await this.prisma.medication.findFirst({
      where: {
        id,
        pet: {
          userId,
        },
      },
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

  async update(userId: string, id: string, dto: UpdateMedicationDto) {
    await this.findOne(userId, id);

    if (dto.petId) {
      const petExists = await this.prisma.pet.findFirst({
        where: {
          id: dto.petId,
          userId,
        },
      });

      if (!petExists) {
        throw new NotFoundException('Pet não encontrado.');
      }
    }

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

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.medication.delete({
      where: { id },
    });
  }
}
