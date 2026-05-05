export interface Coordinates {
  latitude: number;
  longitude: number;
}

export default class DeliveryDistance {
  private static readonly EARTH_RADIUS_METERS = 6371000;

  constructor(
    public readonly source: Coordinates,
    public readonly destination: Coordinates
  ) {
    this.validate(this.source);
    this.validate(this.destination);
  }
 
  private validate(coords: Coordinates): void {
    if (coords.latitude < -90 || coords.latitude > 90) {
      throw new Error("La latitude doit être comprise entre -90 et 90 degrés.");
    }
    if (coords.longitude < -180 || coords.longitude > 180) {
      throw new Error("La longitude doit être comprise entre -180 et 180 degrés.");
    }
  }

  public getInMeters(): number {
    const haversine = this.calculateHaversine();
    const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    
    const distance = DeliveryDistance.EARTH_RADIUS_METERS * centralAngle;
    return Number(distance.toFixed(3));
  }

  
  public getInKilometers(): number {
    return this.getInMeters() / 1000;
  }

  // Application de  la formule d'Haversine pour le calcul de la distance à vol d'oiseau

  private calculateHaversine(): number {
    const lat1 = this.toRadians(this.source.latitude);
    const lat2 = this.toRadians(this.destination.latitude);
    const dLat = this.toRadians(this.destination.latitude - this.source.latitude);
    const dLon = this.toRadians(this.destination.longitude - this.source.longitude);

    return (
      Math.pow(Math.sin(dLat / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dLon / 2), 2)
    );
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}