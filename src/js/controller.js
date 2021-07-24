const parametersForm = document.querySelector('.params-form');
const infoPlate = document.querySelector('.info-plate');
const resultButtons = document.querySelector('.result-buttons');
const infoModal = document.querySelector('#modal-info');

const startButton = document.querySelector('#button-start');
const stopButton = document.querySelector('#button-stop');
const saveButton = document.querySelector('#button-save');
const clearButton = document.querySelector('#button-clear');
const infoButton = document.querySelector('#button-info');
const restartButton = document.querySelector('#button-restart');
const buttonBack = document.querySelector('#button-back');
const closeModalButton = document.querySelector('#button-close-modal');

const populationSizeInput = document.querySelector('#population-size');
const chromosomeLengthInput = document.querySelector('#chromosome-length');
const crossoverProbabilityInput = document.querySelector('#crossover-probability');
const mutationProbabilityInput = document.querySelector('#mutation-probability');
const desiredFitnessInput = document.querySelector('#desired-fitness');
const timeoutStepsInput = document.querySelector('#timeout-steps');
const timeoutGenerationsInput = document.querySelector('#timeout-generations');
const finishOnlyLastStepCheckbox = document.querySelector('#only-last-step');

const generationInfo = document.querySelector('#generation-info');
const fitnessInfo = document.querySelector('#fitness-info');
const populationSizeInfo = document.querySelector('#population-size-info');
const chromosomeLengthInfo = document.querySelector('#chromosome-length-info');
const crossoverRateInfo = document.querySelector('#crossover-rate-info');
const mutationRateInfo = document.querySelector('#mutation-rate-info');

const wait = (seconds) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
};

export class Controller {
  constructor(geneticAlgorithm, templates) {
    this.geneticAlgorithm = geneticAlgorithm;
    this.board = geneticAlgorithm.board;
    this.templates = templates;

    this.addEventListeners();
  }

  addEventListeners() {
    startButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (!this.board.startCell || !this.board.finishCell) {
        alert('You should set start and finish to run algorithm');
        return;
      }
      this.startGeneticAlgorithm();
    });

    stopButton.addEventListener('click', (e) => {
      this.geneticAlgorithm.isBusy = false;
    });

    restartButton.addEventListener('click', (e) => {
      this.startGeneticAlgorithm();
    });

    buttonBack.addEventListener('click', (e) => {
      this.board.clearPathCells();

      this.showElement(parametersForm);
      this.hideElement(resultButtons);
      this.hideElement(infoPlate);

      this.board.isDisabled = false;

      this.templates.isDisabled = false;
      this.enableElement(saveButton);
      this.enableElement(clearButton);
      this.enableElement(infoButton);
    });

    closeModalButton.addEventListener('click', () => {
      this.hideElement(infoModal);
    });

    infoModal.addEventListener('click', (e) => {
      if (e.target === infoModal) {
        this.hideElement(infoModal);
      }
    });

    infoButton.addEventListener('click', () => {
      this.showElement(infoModal);
    });
  }

  async renderFittestPath() {
    this.board.clearPathCells();

    const fittestGenome = this.geneticAlgorithm.fittestGenome;
    const directions = this.geneticAlgorithm.decode(fittestGenome);

    let position = [this.board.startCell.y, this.board.startCell.x];

    for (const direction of directions) {
      this.board.move(position, direction);

      const currentCell = this.board.cells[`${position[0]}-${position[1]}`];
      if (currentCell.status !== this.board.cellClasses.start && currentCell.status !== this.board.cellClasses.finish) {
        currentCell.updateStatus(this.board.cellClasses.path);
      }
      await wait(timeoutStepsInput.value);
    }
  }

  validateNumberInputs(...inputs) {
    let result = true;
    inputs.forEach((input) => {
      if (input.value.length === 0 || Number(input.value) < 0) {
        result = false;
      }
    });

    if (Number(populationSizeInput.value) < 1) result = false;
    if (Number(chromosomeLengthInput.value) % 2 !== 0) result = false;
    return result;
  }

  hideElement(element) {
    element.classList.add('hide');
  }

  showElement(element) {
    element.classList.remove('hide');
  }

  disableElement(element) {
    element.disabled = true;
  }

  enableElement(element) {
    element.disabled = false;
  }

  async startGeneticAlgorithm() {
    if (
      !this.validateNumberInputs(
        populationSizeInput,
        chromosomeLengthInput,
        crossoverProbabilityInput,
        mutationProbabilityInput,
        desiredFitnessInput,
        timeoutStepsInput,
        timeoutGenerationsInput
      )
    ) {
      alert(
        'Incorrect input! Here is the rules: \n' +
          '- All fields are required. \n' +
          '- Population size should be greater than or equal to one. \n' +
          '- Chromosome length should be an even number. \n' +
          '- All other values should be greater than or equal to zero. \n'
      );
      return;
    }
    this.geneticAlgorithm.populationSize = Number(populationSizeInput.value);
    this.geneticAlgorithm.chromosomeLength = Number(chromosomeLengthInput.value);
    this.geneticAlgorithm.crossoverProbability = Number(crossoverProbabilityInput.value);
    this.geneticAlgorithm.mutationProbability = Number(mutationProbabilityInput.value);
    this.geneticAlgorithm.desiredFitnessValue = Number(desiredFitnessInput.value);
    this.geneticAlgorithm.finishOnlyLastStep = finishOnlyLastStepCheckbox.checked;

    this.board.isDisabled = true;
    this.templates.isDisabled = true;
    this.disableElement(saveButton);
    this.disableElement(clearButton);
    this.disableElement(infoButton);

    this.hideElement(parametersForm);
    this.hideElement(resultButtons);
    this.showElement(infoPlate);
    this.showElement(stopButton);

    this.geneticAlgorithm.createInitialPopulation();
    this.geneticAlgorithm.generation = 0;
    this.geneticAlgorithm.isBusy = true;

    populationSizeInfo.innerHTML = this.geneticAlgorithm.populationSize;
    chromosomeLengthInfo.innerHTML = this.geneticAlgorithm.chromosomeLength;
    crossoverRateInfo.innerHTML = `${this.geneticAlgorithm.crossoverProbability * 100}%`;
    mutationRateInfo.innerHTML = `${this.geneticAlgorithm.mutationProbability * 100}%`;

    while (this.geneticAlgorithm.isBusy) {
      this.geneticAlgorithm.epoch();

      generationInfo.innerHTML = this.geneticAlgorithm.generation;
      fitnessInfo.innerHTML = `${this.geneticAlgorithm.fittestGenome.fitness * 100}`.substring(0, 6) + '%';

      await this.renderFittestPath();
      await wait(timeoutGenerationsInput.value);
    }

    this.hideElement(stopButton);
    this.showElement(resultButtons);
  }
}
