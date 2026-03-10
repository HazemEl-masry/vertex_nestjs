import { Controller, Body, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordUserDto } from './dto/change-password-user.dto';
import { JwtGuard } from 'src/common/strategies/jwt.guard';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /*
    update user
  */
  @Patch('update')
  updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.userService.updateUser(updateUserDto, req.user.id);
  }

  /*
    change user password
  */
  @Patch('changePassword')
  changePassword(
    @Body() changePasswordUserDto: ChangePasswordUserDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.userService.changePassword(changePasswordUserDto, req.user.id);
  }
}
