const templatesContainer = document.querySelector('.templates-container');

const saveButton = document.querySelector('#button-save');

const templatePixelMultiplier = 5;

export class Templates {
  constructor(board) {
    this.board = board;
    this.storage = window.localStorage;

    this.isDisabled = false;

    this.createListOfTemplates();
    this.addEventListeners();
  }

  defineCanvasFillStyle(cellStatus) {
    const colors = {
      grass: 'white',
      wall: '#353b48',
      start: '#eb2f06',
      finish: '#8e44ad',
    };
    return colors[cellStatus];
  }

  createListOfTemplates() {
    let templatesHtml = '';
    const width = this.board.width * templatePixelMultiplier;
    const height = this.board.height * templatePixelMultiplier;

    //Get templates that correspond the board size from local storage
    const templatesFromStorage = [];
    for (const key of Object.keys(this.storage)) {
      if (Number(key)) {
        const templateFromStorage = JSON.parse(this.storage.getItem(key));
        if (templateFromStorage.height === this.board.height && templateFromStorage.width === this.board.width) {
          templatesFromStorage.push(templateFromStorage);
        }
      }
    }

    //Sort templates by creation date (id)
    templatesFromStorage.sort((a, b) => {
      if (a.id <= b.id) {
        return -1;
      }
      return 1;
    });

    //Show message if there are no templates
    if (templatesFromStorage.length === 0) {
      templatesHtml = "You don't have any saved templates";
      templatesContainer.innerHTML = templatesHtml;
      return;
    }

    //Make canvases
    for (const template of templatesFromStorage) {
      templatesHtml += `<div id="template-${template.id}" class="template" style="height: ${height}px">
            <i class='bx bx-x bx-sm template-delete' style="left: ${width - 25}px"></i>
            <canvas id="canvas-${
              template.id
            }" class="template-canvas" width="${width}" height="${height}"></canvas></div>`;
    }

    templatesContainer.innerHTML = templatesHtml;

    //Draw thumbnails for templates in canvases
    for (const template of templatesFromStorage) {
      const canvas = document.getElementById(`canvas-${template.id}`);
      const ctx = canvas.getContext('2d');
      for (let i = 0; i < template.boardArray.length; i++) {
        for (let j = 0; j < template.boardArray[i].length; j++) {
          ctx.fillStyle = this.defineCanvasFillStyle(template.boardArray[i][j].status);
          ctx.fillRect(
            j * templatePixelMultiplier,
            i * templatePixelMultiplier,
            templatePixelMultiplier,
            templatePixelMultiplier
          );
        }
      }
    }
  }

  addEventListeners() {
    const removePath = (boardArray) => {
      for (const row of boardArray) {
        for (const cell of row) {
          if (cell.status === this.board.cellClasses.path) {
            console.log('remove');
            cell.status = this.board.cellClasses.grass;
          }
        }
      }
      return boardArray;
    };

    const saveTemplate = () => {
      //Check number of templates in local storage for this board size. No more than 5 are allowed
      let numberOfTemplates = 0;
      for (const key of Object.keys(this.storage)) {
        if (Number(key)) {
          const templateFromStorage = JSON.parse(this.storage.getItem(key));
          if (templateFromStorage.height === this.board.height && templateFromStorage.width === this.board.width) {
            numberOfTemplates++;
          }
        }
      }
      if (numberOfTemplates > 4) {
        alert('You cannot store more than 5 templates');
        return;
      }

      let lastId = this.storage.getItem('lastIndex');
      if (!lastId) {
        lastId = 1;
        this.storage.setItem('lastIndex', lastId);
      } else {
        lastId++;
        this.storage.setItem('lastIndex', lastId);
      }

      const boardTemplate = {
        id: lastId,
        height: this.board.height,
        width: this.board.width,
        boardArray: removePath(this.board.boardArray),
      };
      this.storage.setItem(lastId, JSON.stringify(boardTemplate));

      this.createListOfTemplates();
    };

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (this.isDisabled) return;
        saveTemplate();
      }
    });

    saveButton.addEventListener('click', () => {
      if (this.isDisabled) return;
      saveTemplate();
    });

    templatesContainer.addEventListener('click', (e) => {
      if (this.isDisabled) return;
      if (!e.target.classList.contains('template-canvas') && !e.target.classList.contains('template-delete')) return;

      //Click on delete icon (delete template)
      if (e.target.classList.contains('template-delete')) {
        if (confirm('You are going to delete this template')) {
          this.storage.removeItem(e.target.parentNode.id.split('-')[1]);
          this.createListOfTemplates();
        }
        return;
      }

      //Click on template (use it)
      const templateId = e.target.id.split('-')[1];
      const templateFromStorage = JSON.parse(this.storage.getItem(templateId));
      this.board.useTemplate(templateFromStorage.boardArray);
    });
  }
}
