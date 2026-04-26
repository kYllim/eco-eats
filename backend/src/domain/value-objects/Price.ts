export default class Price {
  constructor(public readonly value: number) {
    if (value < 0) {
      throw new Error("Un prix ne peut pas être négatif.");
    }
  }
}