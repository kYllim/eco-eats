export type AllowedAllergens = 
  | 'Gluten' 
  | 'Arachides' 
  | 'Lait' 
  | 'Œufs' 
  | 'Poissons' 
  | 'Soja' 
  | 'Crustacés';

export class Allergen {
  private readonly _name: AllowedAllergens;

  constructor(name: string) {
    this.validate(name);
    this._name = name as AllowedAllergens;
  }

  private validate(name: string): void {
    const validAllergens: string[] = [
      'Gluten', 'Arachides', 'Lait', 'Œufs', 'Poissons', 'Soja', 'Crustacés'
    ];

    if (!validAllergens.includes(name)) {
      throw new Error(`L'allergène "${name}" n'est pas reconnu par le système.`);
    }
  }

  get name(): string {
    return this._name;
  }

  public equals(other: Allergen): boolean {
    return this._name === other.name;
  }
}