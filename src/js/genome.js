export class Genome {
  constructor(numberOfBits) {
    this.bits = [];
    this.fitness = 0;

    if (numberOfBits) {
      for (let i = 0; i < numberOfBits; i++) {
        const randomBit = Math.random() <= 0.5 ? 0 : 1;
        this.bits.push(randomBit);
      }
    }
  }
}
