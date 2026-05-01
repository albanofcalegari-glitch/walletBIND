import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PositionNestService } from './position-nest.service';

@Controller('position')
@UseGuards(JwtAuthGuard)
export class PositionController {
  constructor(private positionService: PositionNestService) {}

  @Get()
  getConsolidatedPosition(@Request() req: any) {
    return this.positionService.getConsolidatedPosition(req.user.companyId);
  }
}
