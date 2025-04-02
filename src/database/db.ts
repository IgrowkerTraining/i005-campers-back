import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DataBase extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      return await this.$connect();
    } catch (error) {
      throw new Error(error);
    }
  }
}