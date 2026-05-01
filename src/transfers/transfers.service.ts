import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class TransfersService {
  private ledger: LedgerService;

  constructor(private prisma: PrismaService) {
    this.ledger = new LedgerService(prisma);
  }

  async internalTransfer(companyId: string, body: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    description?: string;
  }) {
    if (body.amount <= 0) throw new BadRequestException('El monto debe ser positivo');

    const fromWallet = await this.prisma.wallet.findUniqueOrThrow({ where: { id: body.fromWalletId } });
    if (fromWallet.companyId !== companyId) throw new ForbiddenException();

    const toWallet = await this.prisma.wallet.findUniqueOrThrow({ where: { id: body.toWalletId } });
    if (toWallet.type !== 'COMPANY') throw new BadRequestException('Destino invalido');

    const idempotencyKey = `INT-${randomUUID()}`;

    const tx = await this.ledger.postTransaction({
      idempotencyKey,
      type: 'TRANSFER',
      description: body.description ?? 'Transferencia interna',
      entries: [{
        debitWalletId: body.fromWalletId,
        creditWalletId: body.toWalletId,
        amount: body.amount,
      }],
    });

    await this.prisma.transfer.create({
      data: {
        transactionId: tx.id,
        direction: 'INTERNAL',
        sourceWalletId: body.fromWalletId,
        amount: body.amount,
        currency: fromWallet.currency,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return tx;
  }

  async externalTransfer(companyId: string, body: {
    fromWalletId: string;
    destCbu: string;
    amount: number;
    concepto?: string;
    description?: string;
  }) {
    if (body.amount <= 0) throw new BadRequestException('El monto debe ser positivo');

    const fromWallet = await this.prisma.wallet.findUniqueOrThrow({ where: { id: body.fromWalletId } });
    if (fromWallet.companyId !== companyId) throw new ForbiddenException();

    const externalWallet = await this.prisma.wallet.findUniqueOrThrow({
      where: { systemCode: 'EXTERNAL' },
    });

    const idempotencyKey = `EXT-${randomUUID()}`;

    const tx = await this.ledger.postTransaction({
      idempotencyKey,
      type: 'EXTERNAL',
      description: body.description ?? 'Transferencia externa',
      entries: [{
        debitWalletId: body.fromWalletId,
        creditWalletId: externalWallet.id,
        amount: body.amount,
      }],
    });

    await this.prisma.transfer.create({
      data: {
        transactionId: tx.id,
        direction: 'OUTBOUND',
        sourceWalletId: body.fromWalletId,
        destCbu: body.destCbu,
        amount: body.amount,
        currency: fromWallet.currency,
        concepto: body.concepto ?? 'VAR',
        bindOriginId: idempotencyKey.slice(0, 15),
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return tx;
  }

  async listTransfers(companyId: string, options: {
    page?: number;
    limit?: number;
    direction?: string;
  }) {
    const wallets = await this.prisma.wallet.findMany({
      where: { companyId, type: 'COMPANY' },
      select: { id: true },
    });
    const walletIds = wallets.map((w) => w.id);

    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 20, 100);

    const where: any = { sourceWalletId: { in: walletIds } };
    if (options.direction) where.direction = options.direction;

    const [transfers, total] = await Promise.all([
      this.prisma.transfer.findMany({
        where,
        include: { transaction: { select: { type: true, description: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transfer.count({ where }),
    ]);

    return {
      data: transfers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }
}
