/**
 * Représente le stock journalier d'un consommable
 * Stocke le stock de base et le stock journalier courant
 * Avec support pour la réinitialisation automatique à minuit
 */
export class DailyStock {
  private baseStock: number;
  private currentStock: number;
  private lastResetDate: Date;

  constructor(baseStock: number, currentStock?: number) {
    this.baseStock = baseStock;
    this.currentStock = currentStock ?? baseStock;
    this.lastResetDate = new Date();
  }

  /**
   * Vérifie et réinitialise le stock si minuit est passé
   */
  private ensureCurrentDay(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastReset = new Date(this.lastResetDate);
    lastReset.setHours(0, 0, 0, 0);

    if (today.getTime() > lastReset.getTime()) {
      this.currentStock = this.baseStock;
      this.lastResetDate = new Date();
    }
  }

  /**
   * Réduit le stock journalier
   */
  reduceStock(quantity: number): void {
    this.ensureCurrentDay();
    if (this.currentStock < quantity) {
      throw new Error(
        `Stock insuffisant. Disponible: ${this.currentStock}, demandé: ${quantity}`,
      );
    }
    this.currentStock -= quantity;
  }

  /**
   * Retourne le stock journalier actuel
   */
  getAvailable(): number {
    this.ensureCurrentDay();
    return this.currentStock;
  }

  /**
   * Retourne le stock de base (quota journalier)
   */
  getBaseStock(): number {
    return this.baseStock;
  }

  /**
   * Retourne le pourcentage d'utilisation du quota journalier
   */
  getUsagePercentage(): number {
    this.ensureCurrentDay();
    return Math.round(
      ((this.baseStock - this.currentStock) / this.baseStock) * 100,
    );
  }

  /**
   * Réinitialise manuellement le stock journalier
   */
  resetManually(): void {
    this.currentStock = this.baseStock;
    this.lastResetDate = new Date();
  }

  /**
   * Retourne true si le stock journalier est vide
   */
  isOutOfStock(): boolean {
    this.ensureCurrentDay();
    return this.currentStock === 0;
  }

  /**
   * Retourne l'état du stock (base, courant, pourcentage d'utilisation, date last reset)
   */
  getStatus(): {
    baseStock: number;
    currentStock: number;
    usagePercentage: number;
    lastResetDate: Date;
  } {
    this.ensureCurrentDay();
    return {
      baseStock: this.baseStock,
      currentStock: this.currentStock,
      usagePercentage: this.getUsagePercentage(),
      lastResetDate: this.lastResetDate,
    };
  }
}
