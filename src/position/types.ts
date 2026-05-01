import type { Currency, CardBrand, CardType, CardStatus, WalletStatus } from '@prisma/client';

// ── Individual product summaries ──

export interface AccountSummary {
  walletId: string;
  label: string;
  cvu: string | null;
  alias: string | null;
  currency: Currency;
  balance: number;
  status: WalletStatus;
}

export interface CardSummary {
  cardId: string;
  lastFour: string;
  brand: CardBrand;
  cardType: CardType;
  cardName: string;
  holderName: string;
  dailyLimit: number;
  monthlyLimit: number;
  spentToday: number;
  spentMonth: number;
  availableDaily: number;
  availableMonthly: number;
  status: CardStatus;
}

export interface CryptoSummary {
  symbol: string;
  amount: number;
  lastPrice: number;
  valuationArs: number;
  lastPriceAt: Date | null;
}

export interface RecentMovement {
  id: string;
  date: Date;
  type: string;
  description: string | null;
  amount: number;
  sign: 'credit' | 'debit';
  balanceAfter: number;
  walletCurrency: Currency;
}

// ── Consolidated position ──

export interface ConsolidatedPosition {
  company: {
    id: string;
    name: string;
    cuit: string;
  };
  totals: {
    ars: number;
    usd: number;
    crypto_ars: number;
    total_ars: number;
  };
  accounts: AccountSummary[];
  cards: CardSummary[];
  crypto: CryptoSummary[];
  recentMovements: RecentMovement[];
  asOf: Date;
}
