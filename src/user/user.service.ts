import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ChangePasswordUserDto } from './dto/change-password-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // ==============> Update User Service <==============

  async updateUser(updateUserDto: UpdateUserDto, userId: string) {
    /*
        fiend user by id
    */
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    /*
        check if the user correct
    */
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

  // ==============> Update User Service <==============

  async changePassword(
    changePasswordUserDto: ChangePasswordUserDto,
    userId: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(
      changePasswordUserDto.currentPassword,
      user.password,
    );

    if (!isMatch)
      throw new UnauthorizedException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(
      changePasswordUserDto.newPassword,
      12,
    );

    return await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
