export function money(amount: number, currency: string = 'ARS'): string {
  if (currency === 'USD') {
    return `USD ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function shortDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

export function fullDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function cryptoAmount(amount: number): string {
  if (amount >= 1) return amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return amount.toLocaleString('es-AR', { minimumFractionDigits: 4, maximumFractionDigits: 8 });
}
