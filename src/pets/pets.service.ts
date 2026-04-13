import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class PetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createPetDto: CreatePetDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.prisma.pet.create({
      data: {
        userId,
        ...createPetDto,
        birthDate: createPetDto.birthDate
          ? new Date(createPetDto.birthDate)
          : undefined,
      },
    });
  }

  async findAll(userId: string, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = { userId };

    const [data, total] = await Promise.all([
      this.prisma.pet.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pet.count({
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
    const pet = await this.prisma.pet.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        user: true,
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet não encontrado.');
    }

    return pet;
  }

  async update(userId: string, id: string, updatePetDto: UpdatePetDto) {
    await this.findOne(userId, id);

    return this.prisma.pet.update({
      where: { id },
      data: {
        ...updatePetDto,
        birthDate: updatePetDto.birthDate
          ? new Date(updatePetDto.birthDate)
          : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.pet.delete({
      where: { id },
    });
  }
}
