export type CurrencyCode = 'PEN' | 'USD';

/**
 * Formatea un monto del CRM.
 * Los montos enteros se muestran sin decimales (S/ 3,000) y los que tienen
 * céntimos siempre con 2 decimales (S/ 3,278.10), para evitar "S/ 3,278.1".
 */
export function formatAmount(amount: number, currency: CurrencyCode = 'PEN'): string {
  // Redondear a céntimos antes de decidir evita que el ruido de coma flotante
  // en sumas (0.1 + 0.2) o valores como 3278.004 cambien el formato
  const hasCents = Math.round(amount * 100) % 100 !== 0;

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
