import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // to make connection with DB
  async onModuleInit() {
    try {
      await this.$connect();
      Logger.log('*-============> ✅ Database connected <============-*');
    } catch (error) {
      Logger.error(
        '*-============> ❌ Database connection failed <============-*',
        error,
      );
    }
  }

  // to end the connection with DB
  async onModuleDestroy() {
    await this.$disconnect();
    Logger.warn('*-============> ⚠️ Database disconnected <============-*');
  }
}
