import { PrismaClient, TransferDirection, TransferStatus, Currency } from '@prisma/client';
import { LedgerService } from './ledger.service';
import { BindClient } from '../bind-client/index';
import type { TransferConcepto } from '../bind-client/types';

interface FundWalletInput {
  walletId: string;
  amount: number;
  description?: string;
  idempotencyKey: string;
}

interface InternalTransferInput {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description?: string;
  idempotencyKey: string;
  feePct?: number;
}

interface ExternalTransferInput {
  fromWalletId: string;
  destCbu: string;
  destAlias?: string;
  amount: number;
  currency?: Currency;
  concepto?: TransferConcepto;
  description?: string;
  idempotencyKey: string;
}

export class TransferService {
  private ledger: LedgerService;

  constructor(
    private prisma: PrismaClient,
    private bind: BindClient | null,
  ) {
    this.ledger = new LedgerService(prisma);
  }

  async fundWallet(input: FundWalletInput) {
    const externalWallet = await this.getSystemWallet('EXTERNAL');

    const tx = await this.ledger.postTransaction({
      idempotencyKey: input.idempotencyKey,
      type: 'FUNDING',
      description: input.description ?? 'Ingreso de fondos',
      entries: [{
        debitWalletId: externalWallet.id,
        creditWalletId: input.walletId,
        amount: input.amount,
      }],
    });

    await this.prisma.transfer.create({
      data: {
        transactionId: tx.id,
        direction: TransferDirection.INBOUND,
        sourceWalletId: input.walletId,
        amount: input.amount,
        currency: 'ARS',
        status: TransferStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    return tx;
  }

  async internalTransfer(input: InternalTransferInput) {
    const entries = [{
      debitWalletId: input.fromWalletId,
      creditWalletId: input.toWalletId,
      amount: input.amount,
    }];

    if (input.feePct && input.feePct > 0) {
      const platformWallet = await this.getSystemWallet('PLATFORM');
      const feeAmount = Math.round(input.amount * input.feePct) / 100;
      if (feeAmount > 0) {
        entries.push({
          debitWalletId: input.fromWalletId,
          creditWalletId: platformWallet.id,
          amount: feeAmount,
        });
      }
    }

    const tx = await this.ledger.postTransaction({
      idempotencyKey: input.idempotencyKey,
      type: 'TRANSFER',
      description: input.description ?? 'Transferencia interna',
      entries,
    });

    await this.prisma.transfer.create({
      data: {
        transactionId: tx.id,
        direction: TransferDirection.INTERNAL,
        sourceWalletId: input.fromWalletId,
        amount: input.amount,
        currency: 'ARS',
        status: TransferStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    return tx;
  }

  async externalTransfer(input: ExternalTransferInput) {
    const externalWallet = await this.getSystemWallet('EXTERNAL');

    const tx = await this.ledger.postTransaction({
      idempotencyKey: input.idempotencyKey,
      type: 'EXTERNAL',
      description: input.description ?? 'Transferencia externa',
      entries: [{
        debitWalletId: input.fromWalletId,
        creditWalletId: externalWallet.id,
        amount: input.amount,
      }],
    });

    const bindOriginId = input.idempotencyKey.slice(0, 15);

    const transfer = await this.prisma.transfer.create({
      data: {
        transactionId: tx.id,
        direction: TransferDirection.OUTBOUND,
        sourceWalletId: input.fromWalletId,
        destCbu: input.destCbu,
        destAlias: input.destAlias,
        amount: input.amount,
        currency: input.currency ?? 'ARS',
        concepto: input.concepto ?? 'VAR',
        bindOriginId,
        status: TransferStatus.INITIATED,
      },
    });

    if (this.bind) {
      try {
        const bindResult = await this.bind.transfers.execute({
          origin_id: bindOriginId,
          to: input.destAlias ? { alias: input.destAlias } : { cbu: input.destCbu },
          value: { currency: input.currency ?? 'ARS', amount: input.amount },
          concepto: input.concepto ?? 'VAR',
          description: input.description,
        });

        await this.prisma.transfer.update({
          where: { id: transfer.id },
          data: {
            bindTransferId: bindResult.id,
            bindStatus: bindResult.status,
            bindRawResponse: bindResult as any,
            status: bindResult.status === 'COMPLETED'
              ? TransferStatus.COMPLETED
              : TransferStatus.SENT_TO_BIND,
            ...(bindResult.status === 'COMPLETED' ? { completedAt: new Date() } : {}),
          },
        });
      } catch (err) {
        await this.prisma.transfer.update({
          where: { id: transfer.id },
          data: {
            status: TransferStatus.FAILED,
            bindRawResponse: { error: String(err) },
          },
        });
        throw err;
      }
    } else {
      await this.prisma.transfer.update({
        where: { id: transfer.id },
        data: {
          status: TransferStatus.COMPLETED,
          completedAt: new Date(),
          bindRawResponse: { mock: true },
        },
      });
    }

    return { transaction: tx, transfer };
  }

  private async getSystemWallet(code: string) {
    return this.prisma.wallet.findUniqueOrThrow({
      where: { systemCode: code },
    });
  }
}
