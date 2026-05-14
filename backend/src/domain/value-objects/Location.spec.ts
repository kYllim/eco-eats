import { Location } from './Location';

describe('Location', () => {
  it('rejects an out-of-range latitude', () => {
    expect(() => Location.create(91, 0)).toThrow(/Latitude/);
    expect(() => Location.create(-91, 0)).toThrow(/Latitude/);
  });

  it('rejects an out-of-range longitude', () => {
    expect(() => Location.create(0, 181)).toThrow(/Longitude/);
    expect(() => Location.create(0, -181)).toThrow(/Longitude/);
  });

  it('returns 0 km between two identical points', () => {
    const point = Location.create(48.8566, 2.3522);
    expect(point.calculateDistanceKmTo(point)).toBe(0);
  });

  it('computes a haversine distance Paris ↔ Lyon ≈ 392 km (±5 km)', () => {
    const paris = Location.create(48.8566, 2.3522);
    const lyon = Location.create(45.764, 4.8357);
    const distance = paris.calculateDistanceKmTo(lyon);
    expect(distance).toBeGreaterThan(387);
    expect(distance).toBeLessThan(397);
  });
});
