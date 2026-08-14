import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString } from 'class-validator';

export class QueryLogDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 10, default: 10 })
  @IsOptional()
  @IsInt()
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: '模块名称' })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ description: '操作用户' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: '操作状态 0成功 1失败' })
  @IsOptional()
  @IsInt()
  status?: number;
}
