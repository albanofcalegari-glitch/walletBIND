import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CardsService } from './cards.service';

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Get()
  list(@Request() req: any) {
    return this.cardsService.listByCompany(req.user.companyId);
  }

  @Get(':id')
  getCard(@Param('id') id: string, @Request() req: any) {
    return this.cardsService.getCard(id, req.user.companyId);
  }

  @Post(':id/freeze')
  freeze(@Param('id') id: string, @Request() req: any) {
    return this.cardsService.freezeCard(id, req.user.companyId);
  }

  @Post(':id/unfreeze')
  unfreeze(@Param('id') id: string, @Request() req: any) {
    return this.cardsService.unfreezeCard(id, req.user.companyId);
  }

  @Patch(':id/limits')
  updateLimits(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { dailyLimit?: number; monthlyLimit?: number },
  ) {
    return this.cardsService.updateLimits(id, req.user.companyId, body);
  }
}
