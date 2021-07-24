import { Cell } from './cell.js';

const boardElement = document.querySelector('#board');
const clearButton = document.querySelector('#button-clear');

const findDistance = (pointA, pointB) => {
  return Math.hypot(pointB[0] - pointA[0], pointB[1] - pointA[1]);
};

export class Board {
  constructor(height, width) {
    this.height = height;
    this.width = width;
    this.boardArray = [];
    this.cells = {};
    this.startCell = null;
    this.finishCell = null;
    this.maxDistanceToFinish = 0;

    this.isDisabled = false;

    this.cellClasses = {
      grass: 'grass',
      wall: 'wall',
      start: 'start',
      finish: 'finish',
      path: 'path',
    };

    this.createGrid();
    this.addEventListeners();
  }

  createGrid() {
    let tableHtml = '';

    for (let r = 0; r < this.height; r++) {
      const arrayRow = [];
      let htmlRow = `<tr id="row-${r}">`;
      for (let c = 0; c < this.width; c++) {
        const cellId = `${r}-${c}`;
        let cellClass = this.cellClasses.grass;
        if (r === 0 || r + 1 === this.height || c === 0 || c + 1 === this.width) {
          cellClass = this.cellClasses.wall;
        }
        const cell = new Cell(cellId, cellClass);
        arrayRow.push(cell);
        htmlRow += `<td id="${cellId}" class="${cellClass}"></td>`;
        this.cells[cellId] = cell;
      }
      this.boardArray.push(arrayRow);
      tableHtml += `${htmlRow}</tr>`;
    }

    boardElement.innerHTML = tableHtml;
  }

  findMaxDistanceToFinish() {
    const boardCorners = [
      [1, 1],
      [this.height - 2, 1],
      [1, this.width - 2],
      [this.height - 2, this.width - 2],
    ];

    let maxDistance = 0;
    boardCorners.forEach((corner) => {
      const distance = findDistance(corner, [this.finishCell.y, this.finishCell.x]);
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    });
    this.maxDistanceToFinish = maxDistance;
  }

  addEventListeners() {
    const clearBoard = () => {
      this.boardArray = [];
      this.cells = {};
      this.startCell = null;
      this.finishCell = null;

      this.createGrid();
    };

    boardElement.addEventListener('mousedown', (e) => {
      if (e.target.tagName !== 'TD' || this.isDisabled) return;

      let r = Number(e.target.id.split('-')[0]);
      let c = Number(e.target.id.split('-')[1]);
      if (r === 0 || r + 1 === this.height || c === 0 || c + 1 === this.width) return;

      const cell = this.cells[e.target.id];

      if (e.button === 0) {
        if (cell.status === this.cellClasses.wall) {
          cell.updateStatus(this.cellClasses.grass);
        } else {
          if (cell.status === this.cellClasses.start) {
            this.startCell = null;
          }
          if (cell.status === this.cellClasses.finish) {
            this.finishCell = null;
          }
          document.getElementById(cell.id).innerHTML = '';
          cell.updateStatus(this.cellClasses.wall);
        }
      }
      if (e.button === 1) {
        e.preventDefault();
        //Cell is already "start"
        if (cell.status === this.cellClasses.start) {
          cell.updateStatus(this.cellClasses.grass);
          document.getElementById(cell.id).innerHTML = '';
          this.startCell = null;
          return;
        }
        //Remove old "start" if exists
        if (this.startCell) {
          this.startCell.updateStatus(this.cellClasses.grass);
          document.getElementById(this.startCell.id).innerHTML = '';
          this.startCell = null;
        }
        //Set "start"
        this.startCell = cell.updateStatus(this.cellClasses.start);
        document.getElementById(cell.id).innerHTML = 'S';
        //If cell was a finish
        if (this.startCell === this.finishCell) this.finishCell = null;
      }
      if (e.button === 2) {
        //Cell is already "finish"
        if (cell.status === this.cellClasses.finish) {
          cell.updateStatus(this.cellClasses.grass);
          document.getElementById(cell.id).innerHTML = '';
          this.finishCell = null;
          return;
        }
        //Remove old "finish" if exists
        if (this.finishCell) {
          this.finishCell.updateStatus(this.cellClasses.grass);
          document.getElementById(this.finishCell.id).innerHTML = '';
          this.finishCell = null;
        }
        //Set "finish"
        this.finishCell = cell.updateStatus(this.cellClasses.finish);
        document.getElementById(cell.id).innerHTML = 'F';
        this.findMaxDistanceToFinish();
        //If cell was a start
        if (this.startCell === this.finishCell) this.startCell = null;
      }
    });

    clearButton.addEventListener('click', () => {
      clearBoard();
    });
  }

  useTemplate(templateBoardArray) {
    this.boardArray = [];
    this.cells = {};
    this.startCell = null;
    this.finishCell = null;
    let tableHtml = '';

    for (let r = 0; r < templateBoardArray.length; r++) {
      const arrayRow = [];
      let htmlRow = `<tr id="row-${r}">`;
      for (let c = 0; c < templateBoardArray[r].length; c++) {
        const cellId = templateBoardArray[r][c].id;
        const cellClass = templateBoardArray[r][c].status;

        const cell = new Cell(cellId, cellClass);
        arrayRow.push(cell);
        this.cells[cellId] = cell;

        if (cellClass === 'start') {
          this.startCell = this.cells[cellId];
          document.getElementById(cellId).innerHTML = 'S';
        }
        if (cellClass === 'finish') {
          this.finishCell = this.cells[cellId];
          document.getElementById(cellId).innerHTML = 'F';
          this.findMaxDistanceToFinish();
        }

        htmlRow += `<td id="${cellId}" class="${cellClass}"></td>`;
      }
      this.boardArray.push(arrayRow);
      tableHtml += `${htmlRow}</tr>`;
    }

    boardElement.innerHTML = tableHtml;

    if (document.querySelector('.start')) {
      document.querySelector('.start').innerHTML = 'S';
    }
    if (document.querySelector('.finish')) {
      document.querySelector('.finish').innerHTML = 'F';
    }
  }

  move(position, direction) {
    switch (direction) {
      case 0: //Up
        if (this.boardArray[position[0] + 1][position[1]].status !== this.cellClasses.wall) {
          position[0] += 1;
        }
        break;
      case 1: //Down
        if (this.boardArray[position[0] - 1][position[1]].status !== this.cellClasses.wall) {
          position[0] -= 1;
        }
        break;
      case 2: //Right
        if (this.boardArray[position[0]][position[1] + 1].status !== this.cellClasses.wall) {
          position[1] += 1;
        }
        break;
      case 3: //Left
        if (this.boardArray[position[0]][position[1] - 1].status !== this.cellClasses.wall) {
          position[1] -= 1;
        }
        break;
    }
  }

  testRoute(directions) {
    const findDistance = (pointA, pointB) => {
      return Math.hypot(pointB[0] - pointA[0], pointB[1] - pointA[1]);
    };

    const currentPosition = [this.startCell.y, this.startCell.x];
    const finishPosition = [this.finishCell.y, this.finishCell.x];
    let finishCellReached = false;

    directions.forEach((direction) => {
      this.move(currentPosition, direction);
      if (currentPosition[0] === finishPosition[0] && currentPosition[1] === finishPosition[1]) {
        finishCellReached = true;
      }
    });

    const currentDistance = findDistance(currentPosition, finishPosition);

    return [1 - currentDistance / this.maxDistanceToFinish, finishCellReached];
  }

  clearPathCells() {
    const pathElements = document.querySelectorAll('.path');
    pathElements.forEach((element) => {
      this.cells[element.id].updateStatus(this.cellClasses.grass);
    });
  }
}
