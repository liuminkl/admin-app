import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { OperationLog } from '../common/decorators/operation-log.decorator';

@ApiTags('菜单管理')
@ApiBearerAuth()
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('tree')
  @ApiOperation({ summary: '菜单树' })
  @RequirePermission('system:menu:list')
  getTree() {
    return this.menuService.getTree();
  }

  @Get()
  @ApiOperation({ summary: '菜单列表' })
  @RequirePermission('system:menu:list')
  findAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '菜单详情' })
  @RequirePermission('system:menu:list')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '新增菜单' })
  @RequirePermission('system:menu:add')
  @OperationLog({ module: '菜单管理', action: '新增菜单' })
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑菜单' })
  @RequirePermission('system:menu:edit')
  @OperationLog({ module: '菜单管理', action: '编辑菜单' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  @RequirePermission('system:menu:delete')
  @OperationLog({ module: '菜单管理', action: '删除菜单' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }
}
