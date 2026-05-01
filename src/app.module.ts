import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PositionModule } from './position/position.module';
import { AccountsModule } from './accounts/accounts.module';
import { CardsModule } from './cards/cards.module';
import { TransfersModule } from './transfers/transfers.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PositionModule,
    AccountsModule,
    CardsModule,
    TransfersModule,
  ],
})
export class AppModule {}
