import { Controller, Get, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LogService } from './log.service';
import { QueryLogDto } from './dto/log.dto';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { OperationLog } from '../common/decorators/operation-log.decorator';

@ApiTags('操作日志')
@ApiBearerAuth()
@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @ApiOperation({ summary: '操作日志分页' })
  @RequirePermission('system:log:list')
  findAll(@Query() query: QueryLogDto) {
    return this.logService.findAll(query);
  }

  @Delete('clear')
  @ApiOperation({ summary: '清空操作日志' })
  @RequirePermission('system:log:list')
  @OperationLog({ module: '操作日志', action: '清空日志' })
  clear() {
    return this.logService.clear();
  }
}
