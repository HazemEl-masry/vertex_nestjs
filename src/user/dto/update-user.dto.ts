import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'username is not correct' })
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
