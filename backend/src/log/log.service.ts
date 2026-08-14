import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryLogDto } from './dto/log.dto';

@Injectable()
export class LogService {
  constructor(private prisma: PrismaService) {}

  /** 操作日志分页 */
  async findAll(query: QueryLogDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where: any = {};

    if (query.module) where.module = { contains: query.module };
    if (query.username) where.username = { contains: query.username };
    if (query.status !== undefined) where.status = query.status;

    const [total, list] = await Promise.all([
      this.prisma.operationLog.count({ where }),
      this.prisma.operationLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
    ]);

    return { total, page, pageSize, list };
  }

  /** 删除日志 */
  async clear() {
    const result = await this.prisma.operationLog.deleteMany({});
    return { deleted: result.count };
  }
}
