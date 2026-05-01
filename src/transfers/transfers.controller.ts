import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransfersService } from './transfers.service';

@Controller('transfers')
@UseGuards(JwtAuthGuard)
export class TransfersController {
  constructor(private transfersService: TransfersService) {}

  @Post('internal')
  internalTransfer(@Request() req: any, @Body() body: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    description?: string;
  }) {
    return this.transfersService.internalTransfer(req.user.companyId, body);
  }

  @Post('external')
  externalTransfer(@Request() req: any, @Body() body: {
    fromWalletId: string;
    destCbu: string;
    amount: number;
    concepto?: string;
    description?: string;
  }) {
    return this.transfersService.externalTransfer(req.user.companyId, body);
  }

  @Get()
  list(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('direction') direction?: string,
  ) {
    return this.transfersService.listTransfers(req.user.companyId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      direction,
    });
  }
}
