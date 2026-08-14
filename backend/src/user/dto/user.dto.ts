import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  Length,
  IsInt,
  IsArray,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'zhangsan' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(3, 20, { message: '用户名长度需在 3-20 位之间' })
  username: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @Length(6, 32, { message: '密码长度需在 6-32 位之间' })
  password: string;

  @ApiPropertyOptional({ description: '昵称', example: '张三' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: '邮箱', example: 'zhangsan@example.com' })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '状态 1启用 0禁用', example: 1 })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: '角色ID列表', example: [1] })
  @IsOptional()
  @IsArray()
  roleIds?: number[];
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '昵称', example: '张三' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: '邮箱', example: 'zhangsan@example.com' })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '状态 1启用 0禁用', example: 1 })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: '角色ID列表', example: [1] })
  @IsOptional()
  @IsArray()
  roleIds?: number[];
}

export class ResetPasswordDto {
  @ApiProperty({ description: '新密码', example: 'newpass123' })
  @IsString()
  @IsNotEmpty({ message: '新密码不能为空' })
  @Length(6, 32, { message: '密码长度需在 6-32 位之间' })
  password: string;
}

export class QueryUserDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 10, default: 10 })
  @IsOptional()
  @IsInt()
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: '用户名/昵称关键字' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '状态 1启用 0禁用' })
  @IsOptional()
  @IsInt()
  status?: number;
}
