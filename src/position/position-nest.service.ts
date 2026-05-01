import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PositionService } from './position.service';
import type { ConsolidatedPosition } from './types';

@Injectable()
export class PositionNestService extends PositionService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  override async getConsolidatedPosition(companyId: string): Promise<ConsolidatedPosition> {
    return super.getConsolidatedPosition(companyId);
  }
}
