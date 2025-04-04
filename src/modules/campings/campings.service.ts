import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCampingDto } from './dto/create-camping.dto';

@Injectable()
export class CampingsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCampingDto, userId: string) {
    const campingData: Prisma.CampingCreateInput = {
      ...data,
      user: { connect: { id: userId } },
      nearNature: data.nearNature || [],
      photos: data.photos || []
    };
    
    return this.prisma.camping.create({ data: campingData });
  }

  async findAll() {
    return this.prisma.camping.findMany();
  }

  async remove(id: number) {
    return this.prisma.camping.delete({ where: { id } });
  } 
}