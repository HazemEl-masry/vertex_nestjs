import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'up',
      version: '1.0.0',
      database: 'connected',
    };
  }
}
