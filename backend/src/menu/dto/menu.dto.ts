import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Length,
} from 'class-validator';

export class CreateMenuDto {
  @ApiPropertyOptional({ description: '父级ID', example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  parentId?: number = 0;

  @ApiProperty({ description: '菜单名称', example: '用户管理' })
  @IsString()
  @IsNotEmpty({ message: '菜单名称不能为空' })
  @Length(1, 50, { message: '菜单名称长度需在 1-50 位之间' })
  name: string;

  @ApiPropertyOptional({ description: '路由路径', example: '/system/user' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ description: '组件路径', example: 'system/user/index' })
  @IsOptional()
  @IsString()
  component?: string;

  @ApiPropertyOptional({
    description: '类型 1目录 2菜单 3按钮',
    example: 2,
    default: 2,
  })
  @IsOptional()
  @IsInt()
  type?: number = 2;

  @ApiPropertyOptional({ description: '图标', example: 'User' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '排序', example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  sort?: number = 0;

  @ApiPropertyOptional({ description: '状态 1启用 0禁用', example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  status?: number = 1;

  @ApiPropertyOptional({ description: '权限标识', example: 'system:user:add' })
  @IsOptional()
  @IsString()
  perms?: string;

  @ApiPropertyOptional({ description: '是否显示 1显示 0隐藏', example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  visible?: number = 1;
}

export class UpdateMenuDto extends CreateMenuDto {}
