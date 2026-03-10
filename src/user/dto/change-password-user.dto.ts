import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';

export class ChangePasswordUserDto {
  @IsNotEmpty({ message: 'Current Password is required' })
  @IsString({ message: 'Password not valid' })
  @MinLength(8)
  @MaxLength(20)
  currentPassword!: string;

  @IsNotEmpty({ message: 'New Password is required' })
  @IsString({ message: 'Password not valid' })
  @MinLength(8)
  @MaxLength(20)
  newPassword!: string;

  @Match('newPassword', { message: 'Password not match' })
  confirmNewPassword!: string;
}
