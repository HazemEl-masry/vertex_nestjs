import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { ConfigService } from '@nestjs/config';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // =============> Token generator <==============
  private async generateAccessToken(payload: object) {
    return this.jwt.signAsync(payload);
  }

  private async generateRefreshToken(payload: object) {
    return this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });
  }

  // ==============> Register Service <==============
  async register(registerAuthDto: RegisterAuthDto) {
    const { username, email, password, confirmPassword } = registerAuthDto;

    /*
        check if the user already exist
    */
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('email is already in use');
    }

    /*
        hashing password before save it in DB
    */
    const hashedPassword = await bcrypt.hash(password, 12);

    /*
        create user
    */
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    /*
        create payload to create access token
    */
    const payload = { id: user.id, email: user.email };

    /*
        register response
    */
    return {
      message: 'Register successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        access_token: await this.generateAccessToken(payload),
        refresh_token: await this.generateRefreshToken(payload),
        createdAt: user.createdAt,
      },
    };
  }

  // ==============> Login Service <==============
  async login(loginAuthDto: LoginAuthDto) {}
}
