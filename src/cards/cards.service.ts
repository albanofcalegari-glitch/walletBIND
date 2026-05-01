import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async listByCompany(companyId: string) {
    return this.prisma.card.findMany({
      where: {
        wallet: { companyId },
        status: { not: 'CANCELLED' },
      },
      include: {
        wallet: { select: { id: true, currency: true, cvu: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCard(cardId: string, companyId: string) {
    const card = await this.prisma.card.findUniqueOrThrow({
      where: { id: cardId },
      include: {
        wallet: { select: { id: true, companyId: true, currency: true, cvu: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });
    if (card.wallet.companyId !== companyId) throw new ForbiddenException();
    return card;
  }

  async freezeCard(cardId: string, companyId: string) {
    await this.verifyOwnership(cardId, companyId);
    return this.prisma.card.update({
      where: { id: cardId },
      data: { status: 'FROZEN' },
    });
  }

  async unfreezeCard(cardId: string, companyId: string) {
    await this.verifyOwnership(cardId, companyId);
    return this.prisma.card.update({
      where: { id: cardId },
      data: { status: 'ACTIVE' },
    });
  }

  async updateLimits(cardId: string, companyId: string, limits: {
    dailyLimit?: number;
    monthlyLimit?: number;
  }) {
    await this.verifyOwnership(cardId, companyId);
    return this.prisma.card.update({
      where: { id: cardId },
      data: {
        ...(limits.dailyLimit !== undefined ? { dailyLimit: limits.dailyLimit } : {}),
        ...(limits.monthlyLimit !== undefined ? { monthlyLimit: limits.monthlyLimit } : {}),
      },
    });
  }

  private async verifyOwnership(cardId: string, companyId: string) {
    const card = await this.prisma.card.findUniqueOrThrow({
      where: { id: cardId },
      include: { wallet: { select: { companyId: true } } },
    });
    if (card.wallet.companyId !== companyId) throw new ForbiddenException();
  }
}
