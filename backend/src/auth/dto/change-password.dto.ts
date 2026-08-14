import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: '原密码', example: 'admin123' })
  @IsString()
  @IsNotEmpty({ message: '原密码不能为空' })
  oldPassword: string;

  @ApiProperty({ description: '新密码', example: 'newpass123' })
  @IsString()
  @IsNotEmpty({ message: '新密码不能为空' })
  @Length(6, 32, { message: '密码长度需在 6-32 位之间' })
  newPassword: string;
}
