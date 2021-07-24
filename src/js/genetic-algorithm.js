import { Genome } from './genome.js';

export class GeneticAlgorithm {
  constructor(board) {
    this.board = board;

    this.isBusy = false;

    this.genomes = [];
    this.fittestGenome = null;
    this.totalFitnessScore = 0;
    this.generation = 0;
    this.finishOnlyLastStep = true;

    this.populationSize = 160;
    this.chromosomeLength = 100;
    this.geneLength = 2;
    this.crossoverProbability = 0.8;
    this.mutationProbability = 0.01;
    this.desiredFitnessValue = 1;
  }

  createInitialPopulation() {
    this.genomes = [];
    for (let i = 0; i < this.populationSize; i++) {
      this.genomes.push(new Genome(this.chromosomeLength));
    }
  }

  crossover(mom, dad) {
    const babyOne = new Genome();
    const babyTwo = new Genome();

    if (Math.random() > this.crossoverProbability || mom === dad) {
      babyOne.bits = [...mom.bits];
      babyTwo.bits = [...dad.bits];
    } else {
      const crossoverIndex = Math.floor(Math.random() * this.chromosomeLength);
      for (let i = 0; i < crossoverIndex; i++) {
        babyOne.bits.push(mom.bits[i]);
        babyTwo.bits.push(dad.bits[i]);
      }
      for (let i = crossoverIndex; i < this.chromosomeLength; i++) {
        babyOne.bits.push(dad.bits[i]);
        babyTwo.bits.push(mom.bits[i]);
      }
    }
    return [babyOne, babyTwo];
  }

  mutate(genome) {
    for (let i = 0; i < this.chromosomeLength; i++) {
      if (Math.random() < this.mutationProbability) {
        genome.bits[i] = genome.bits[i] === 0 ? 1 : 0;
      }
    }
  }

  geneToInt(gene) {
    let geneStr = '';
    for (let i = 0; i < gene.length; i++) {
      geneStr += gene[i];
    }
    return parseInt(geneStr, 2);
  }

  //Convert bits into directions: 0 = Up, 1 = Down, 2 = Right, 3 = Left
  decode(genome) {
    const directions = [];
    for (let i = 0; i < this.chromosomeLength; i += this.geneLength) {
      const gene = genome.bits.slice(i, i + this.geneLength);
      directions.push(this.geneToInt(gene));
    }
    return directions;
  }

  updateFitnessScores() {
    this.totalFitnessScore = 0;
    let bestFitnessScore = 0;

    for (const genome of this.genomes) {
      const directions = this.decode(genome);
      const testRouteResults = this.board.testRoute(directions);
      genome.fitness = testRouteResults[0];
      this.totalFitnessScore += genome.fitness;

      if (genome.fitness > bestFitnessScore) {
        bestFitnessScore = genome.fitness;
        this.fittestGenome = genome;

        if (genome.fitness >= this.desiredFitnessValue || (!this.finishOnlyLastStep && testRouteResults[1])) {
          this.isBusy = false;
          return;
        }
      }
    }
  }

  rouletteWheelSelection() {
    const slice = Math.random() * this.totalFitnessScore;
    let total = 0;

    for (const genome of this.genomes) {
      total += genome.fitness;
      if (total > slice) {
        return genome;
      }
    }
  }

  epoch() {
    this.updateFitnessScores();

    this.generation++;

    if (!this.isBusy) return;

    const babies = [];
    while (babies.length < this.populationSize) {
      const mom = this.rouletteWheelSelection();
      const dad = this.rouletteWheelSelection();
      const [babyOne, babyTwo] = this.crossover(mom, dad);
      this.mutate(babyOne);
      this.mutate(babyTwo);
      babies.push(babyOne);
      babies.push(babyTwo);
    }

    this.genomes = babies;
  }
}
