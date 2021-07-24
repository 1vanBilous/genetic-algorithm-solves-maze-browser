export class Cell {
  constructor(id, status) {
    this.id = id;
    this.status = status;
  }

  updateStatus(status) {
    this.status = status;
    const cellElement = document.getElementById(`${this.id}`);
    cellElement.classList.remove(...cellElement.classList);
    cellElement.classList.add(status);
    return this;
  }

  get y() {
    return Number(this.id.split('-')[0]);
  }

  get x() {
    return Number(this.id.split('-')[1]);
  }
}
