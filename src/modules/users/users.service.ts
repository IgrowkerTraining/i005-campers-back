import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        campings: true,
      },
    });

    return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        campings: true,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async create(data: any) {}

  async update(id: string, data: any) {
    return await this.prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
    const user = await this.prisma.user.delete({
      where: {
        id,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
