const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

export class Location {
  private constructor(
    public readonly latitude: number,
    public readonly longitude: number,
  ) {}

  static create(latitude: number, longitude: number): Location {
    if (latitude < -90 || latitude > 90) {
      throw new Error(
        `Latitude invalide : ${latitude}. Doit être entre -90 et 90.`,
      );
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error(
        `Longitude invalide : ${longitude}. Doit être entre -180 et 180.`,
      );
    }
    return new Location(latitude, longitude);
  }

  calculateDistanceKmTo(destination: Location): number {
    const deltaLat = toRadians(destination.latitude - this.latitude);
    const deltaLon = toRadians(destination.longitude - this.longitude);

    const haversineTerm =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(toRadians(this.latitude)) *
        Math.cos(toRadians(destination.latitude)) *
        Math.sin(deltaLon / 2) ** 2;

    const centralAngle =
      2 * Math.atan2(Math.sqrt(haversineTerm), Math.sqrt(1 - haversineTerm));

    return EARTH_RADIUS_KM * centralAngle;
  }

  equals(other: Location): boolean {
    return (
      this.latitude === other.latitude && this.longitude === other.longitude
    );
  }
}
