import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  QueryUserDto,
  ResetPasswordDto,
} from './dto/user.dto';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { OperationLog } from '../common/decorators/operation-log.decorator';

@ApiTags('用户管理')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '用户分页列表' })
  @RequirePermission('system:user:list')
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '用户详情' })
  @RequirePermission('system:user:list')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '新增用户' })
  @RequirePermission('system:user:add')
  @OperationLog({ module: '用户管理', action: '新增用户' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑用户' })
  @RequirePermission('system:user:edit')
  @OperationLog({ module: '用户管理', action: '编辑用户' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @RequirePermission('system:user:delete')
  @OperationLog({ module: '用户管理', action: '删除用户' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  @Put(':id/password')
  @ApiOperation({ summary: '重置密码' })
  @RequirePermission('system:user:edit')
  @OperationLog({ module: '用户管理', action: '重置密码' })
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.userService.resetPassword(id, dto);
  }
}
