import { Wallet } from '../value-objects/Wallet';

export type CourierStatus = 'AVAILABLE' | 'UNAVAILABLE';
export type CourierTier = 'STANDARD' | 'EXPERT';

const MAX_DELIVERIES_STANDARD = 1;
const MAX_DELIVERIES_EXPERT = 2;

// Coefficients de rémunération
const EARNINGS_MULTIPLIER_STANDARD = 1.0;
const EARNINGS_MULTIPLIER_EXPERT = 1.5; // EXPERT gagne 50% de plus

// Distance minimale pour préférer un livreur EXPERT (km)
const DISTANCE_THRESHOLD_EXPERT = 2.0;

export class Courier {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    private readonly _status: CourierStatus,
    public readonly tier: CourierTier,
    private readonly _wallet: Wallet,
    private readonly _activeDeliveryIds: string[],
    private readonly _currentRestaurantId: string | null,
  ) {}

  static create(params: {
    id: string;
    name: string;
    tier?: CourierTier;
    initialBalance?: number;
  }): Courier {
    if (!params.name.trim()) {
      throw new Error('Le nom du livreur ne peut pas être vide.');
    }
    return new Courier(
      params.id,
      params.name,
      'UNAVAILABLE',
      params.tier ?? 'STANDARD',
      Wallet.create(params.initialBalance ?? 0),
      [],
      null,
    );
  }

  get status(): CourierStatus {
    return this._status;
  }

  get wallet(): Wallet {
    return this._wallet;
  }

  get activeDeliveryIds(): ReadonlyArray<string> {
    return this._activeDeliveryIds;
  }

  get currentRestaurantId(): string | null {
    return this._currentRestaurantId;
  }

  setAvailable(): Courier {
    return new Courier(
      this.id,
      this.name,
      'AVAILABLE',
      this.tier,
      this._wallet,
      this._activeDeliveryIds,
      this._currentRestaurantId,
    );
  }

  setUnavailable(): Courier {
    return new Courier(
      this.id,
      this.name,
      'UNAVAILABLE',
      this.tier,
      this._wallet,
      this._activeDeliveryIds,
      this._currentRestaurantId,
    );
  }

  private get _maxDeliveries(): number {
    return this.tier === 'EXPERT'
      ? MAX_DELIVERIES_EXPERT
      : MAX_DELIVERIES_STANDARD;
  }

  /**
   * Vérifie si le livreur peut accepter une livraison
   * Les EXPERT peuvent gérer 2 livraisons simultanées
   */
  canAcceptDelivery(incomingRestaurantId: string): boolean {
    if (this._status === 'UNAVAILABLE') return false;
    if (this._activeDeliveryIds.length >= this._maxDeliveries) return false;
    if (this._currentRestaurantId === null) return true;
    return this._currentRestaurantId === incomingRestaurantId;
  }

  /**
   * Détermine si ce livreur est préféré pour une livraison longue distance
   * Les livreurs EXPERT sont préférés pour les longues distances
   */
  isPreferredForDistance(distanceKm: number): boolean {
    if (this.tier !== 'EXPERT') {
      return false;
    }
    return distanceKm >= DISTANCE_THRESHOLD_EXPERT;
  }

  /**
   * Calcule les gains pour une livraison
   * Les livreurs EXPERT gagnent un multiplier supérieur
   */
  calculateEarnings(baseEarnings: number): number {
    const multiplier =
      this.tier === 'EXPERT'
        ? EARNINGS_MULTIPLIER_EXPERT
        : EARNINGS_MULTIPLIER_STANDARD;
    return Math.round(baseEarnings * multiplier * 100) / 100;
  }

  /**
   * Retourne le nombre maximum de livraisons simultanées
   */
  getMaxConcurrentDeliveries(): number {
    return this._maxDeliveries;
  }

  /**
   * Retourne le multiplicateur de gains pour ce livreur
   */
  getEarningsMultiplier(): number {
    return this.tier === 'EXPERT'
      ? EARNINGS_MULTIPLIER_EXPERT
      : EARNINGS_MULTIPLIER_STANDARD;
  }

  assignDelivery(deliveryId: string, restaurantId: string): Courier {
    if (!this.canAcceptDelivery(restaurantId)) {
      throw new Error(
        `Le livreur ${this.name} ne peut pas accepter cette livraison.`,
      );
    }
    return new Courier(
      this.id,
      this.name,
      this._status,
      this.tier,
      this._wallet,
      [...this._activeDeliveryIds, deliveryId],
      restaurantId,
    );
  }

  completeDelivery(deliveryId: string, earningsEur: number): Courier {
    const remainingDeliveries = this._activeDeliveryIds.filter(
      (id) => id !== deliveryId,
    );
    const nextRestaurantId =
      remainingDeliveries.length === 0 ? null : this._currentRestaurantId;

    // Appliquer le multiplicateur de gains selon le tier
    const finalEarnings = this.calculateEarnings(earningsEur);

    return new Courier(
      this.id,
      this.name,
      this._status,
      this.tier,
      this._wallet.credit(finalEarnings),
      remainingDeliveries,
      nextRestaurantId,
    );
  }

  static reconstitute(params: {
    id: string;
    name: string;
    status: CourierStatus;
    tier: CourierTier;
    wallet: Wallet;
    activeDeliveryIds: string[];
    currentRestaurantId: string | null;
  }): Courier {
    return new Courier(
      params.id,
      params.name,
      params.status,
      params.tier,
      params.wallet,
      params.activeDeliveryIds,
      params.currentRestaurantId,
    );
  }
}
