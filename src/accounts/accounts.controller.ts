import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountsService } from './accounts.service';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  list(@Request() req: any) {
    return this.accountsService.listByCompany(req.user.companyId);
  }

  @Get(':id/balance')
  getBalance(@Param('id') id: string, @Request() req: any) {
    return this.accountsService.getBalance(id, req.user.companyId);
  }

  @Get(':id/movements')
  getMovements(
    @Param('id') id: string,
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.accountsService.getMovements(id, req.user.companyId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      from,
      to,
    });
  }
}
