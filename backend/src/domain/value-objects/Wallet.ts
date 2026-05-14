const BASE_FARE_EUR = 1.5;
const PRICE_PER_KM_EUR = 0.5;

export class Wallet {
  private constructor(
    public readonly balance: number
  ) {}

  static create(initialBalance: number = 0): Wallet {
    if (initialBalance < 0) {
      throw new Error(
        'Le solde initial du portefeuille ne peut pas être négatif.'
      );
    }
    return new Wallet(initialBalance);
  }

  static calculateDeliveryEarnings(
    distanceKm: number, 
    tipEur: number
  ): number {
    return BASE_FARE_EUR + PRICE_PER_KM_EUR * distanceKm + tipEur;
  }

  credit(amountEur: number): Wallet {
    if (amountEur < 0) {
      throw new Error(
        'Le montant à créditer ne peut pas être négatif.'
      );
    }
    return new Wallet(this.balance + amountEur);
  }
}