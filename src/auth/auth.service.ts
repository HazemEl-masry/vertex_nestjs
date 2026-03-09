import {
  ConflictException,
  Injectable,
  UnauthorizedException,
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
    const { username, email, password } = registerAuthDto;

    /*
        check if the user already exist
    */
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
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
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    /*
        add refresh token to DB
    */
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(refreshToken, 12) },
    });

    /*
        register response
    */
    return {
      message: 'Register successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        access_token: accessToken,
        refresh_token: refreshToken,
        createdAt: user.createdAt,
      },
    };
  }

  // ==============> Login Service <==============
  async login(loginAuthDto: LoginAuthDto) {
    const { email, password } = loginAuthDto;

    /*
        find the user
    */
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    /*
        check if email is correct
    */
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    /*
        decrypt the password and check is correct
    */
    const validatedPassword = await bcrypt.compare(password, user.password);

    if (!validatedPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    /*
        add new refresh token to DB
    */
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(refreshToken, 12) },
    });

    /*
        Login response
    */
    return {
      message: 'Login successfully',
      data: {
        id: user.id,
        email: user.email,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  }

  // ==============> Refresh Token Service <==============
  async refreshToken(userId: string, refreshToken: string) {
    /*
      find user by id
    */
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    /*
      check if the id is correct and refresh token is in DB or no
    */
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    /*
      compare between refresh token from user with refresh token in DB
    */
    const tokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!tokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.generateAccessToken(payload);
    const newRefreshToken = await this.generateRefreshToken(payload);

    /*
      update the refresh token and add it to DB
    */
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(newRefreshToken, 12) },
    });

    /*
      refresh token response
    */
    return {
      message: 'Token refreshed successfully',
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  // ==============> Logout Service <==============
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: 'Logout successfully' };
  }
}
