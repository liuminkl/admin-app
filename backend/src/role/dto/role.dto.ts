import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  IsInt,
  IsArray,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: '运营人员' })
  @IsString()
  @IsNotEmpty({ message: '角色名称不能为空' })
  @Length(2, 50, { message: '角色名称长度需在 2-50 位之间' })
  name: string;

  @ApiProperty({ description: '角色标识', example: 'operator' })
  @IsString()
  @IsNotEmpty({ message: '角色标识不能为空' })
  @Length(2, 50, { message: '角色标识长度需在 2-50 位之间' })
  code: string;

  @ApiPropertyOptional({ description: '角色描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '状态 1启用 0禁用', example: 1 })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsOptional()
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({ description: '菜单ID列表', example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  menuIds?: number[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ description: '角色名称', example: '运营人员' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '角色标识', example: 'operator' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '角色描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '状态 1启用 0禁用', example: 1 })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsOptional()
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({ description: '菜单ID列表', example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  menuIds?: number[];
}

export class QueryRoleDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 10, default: 10 })
  @IsOptional()
  @IsInt()
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: '角色名称关键字' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '状态 1启用 0禁用' })
  @IsOptional()
  @IsInt()
  status?: number;
}
