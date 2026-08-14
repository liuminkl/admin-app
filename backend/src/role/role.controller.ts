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
import { RoleService } from './role.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  QueryRoleDto,
} from './dto/role.dto';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { OperationLog } from '../common/decorators/operation-log.decorator';

@ApiTags('角色管理')
@ApiBearerAuth()
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: '角色分页列表' })
  @RequirePermission('system:role:list')
  findAll(@Query() query: QueryRoleDto) {
    return this.roleService.findAll(query);
  }

  @Get('options')
  @ApiOperation({ summary: '全部角色（下拉）' })
  findAllOptions() {
    return this.roleService.findAllOptions();
  }

  @Get(':id')
  @ApiOperation({ summary: '角色详情' })
  @RequirePermission('system:role:list')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '新增角色' })
  @RequirePermission('system:role:add')
  @OperationLog({ module: '角色管理', action: '新增角色' })
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑角色' })
  @RequirePermission('system:role:edit')
  @OperationLog({ module: '角色管理', action: '编辑角色' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @RequirePermission('system:role:delete')
  @OperationLog({ module: '角色管理', action: '删除角色' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.remove(id);
  }

  @Put(':id/menus')
  @ApiOperation({ summary: '角色分配菜单权限' })
  @RequirePermission('system:role:edit')
  @OperationLog({ module: '角色管理', action: '分配菜单权限' })
  assignMenus(
    @Param('id', ParseIntPipe) id: number,
    @Body('menuIds') menuIds: number[],
  ) {
    return this.roleService.assignMenus(id, menuIds ?? []);
  }
}
