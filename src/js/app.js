import { Board } from './board.js';
import { Templates } from './templates.js';
import { Controller } from './controller.js';
import { GeneticAlgorithm } from './genetic-algorithm.js';

const templatesContainer = document.querySelector('.templates-container');
const toolsContainer = document.querySelector('.tools-container');
const saveContainer = document.querySelector('.save-container');

const templatesAndSaveHeight = templatesContainer.offsetHeight + saveContainer.offsetHeight;

const height = Math.floor((document.body.offsetHeight - templatesAndSaveHeight) / 39);
const width = Math.floor((document.body.offsetWidth - toolsContainer.offsetWidth) / 39);
const board = new Board(height, width);
const templates = new Templates(board);
const geneticAlgorithm = new GeneticAlgorithm(board);
const controller = new Controller(geneticAlgorithm, templates);
