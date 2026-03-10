import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async updateUser(updateUserDto: UpdateUserDto, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: updateUserDto.username,
        email: updateUserDto.email,
      },
    });
  }
}
