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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingEmail && existingEmail.id !== userId) {
        throw new ConflictException('Email is already in use');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateUserDto.username && { username: updateUserDto.username }),
        ...(updateUserDto.email && { email: updateUserDto.email }),
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return {
      message: 'Updated successfully',
      data: updatedUser,
    };
  }

  // ==============> Change Password User Service <==============

  async changePassword(
    changePasswordUserDto: ChangePasswordUserDto,
    userId: string,
  ) {
    /*
      find user by id
  */
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    /*
      check if the user exists
  */
    if (!user) {
      throw new NotFoundException('User not found');
    }

    /*
      check current password
  */
    const isMatch = await bcrypt.compare(
      changePasswordUserDto.currentPassword,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    /*
      hash new password
  */
    const hashedPassword = await bcrypt.hash(
      changePasswordUserDto.newPassword,
      12,
    );

    /*
      update password
  */
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return {
      message: 'Password changed successfully',
      data: updatedUser,
    };
  }
}
