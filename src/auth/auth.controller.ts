import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { JwtGuard } from './strategies/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*
    register / create account
  */
  @Post('register')
  register(@Body() registerAuthDto: RegisterAuthDto) {
    return this.authService.register(registerAuthDto);
  }

  /*
    login
  */
  @Post('login')
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  /*
    refresh token
  */
  @UseGuards(JwtGuard)
  @Post('refresh')
  refresh(
    @Req() req: Request & { user: { id: string; email: string } },
    @Body() body: { refreshToken: string },
  ) {
    return this.authService.refreshToken(req.user.id, body.refreshToken);
  }

  /*
    logout
  */
  @UseGuards(JwtGuard)
  @Post('logout')
  logout(@Req() req: Request & { user: { id: string; email: string } }) {
    return this.authService.logout(req.user.id);
  }
}
