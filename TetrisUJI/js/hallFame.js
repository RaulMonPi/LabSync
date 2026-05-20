// Hall of Fame screen

class HallOfFame {

  constructor(thesize = 10) {
    this.size = thesize;
    this.list = [];
  }

  // guardar el nombre
  addNewScore(newScore, playerName) {
    let i;
    for (i = 0; i < this.list.length; i++)
      if (newScore > this.list[i].score)
        break;
    let instant = (new Date()).toUTCString();
    this.list.splice(i, 0, { score: newScore, date: instant, name: playerName });
    if (this.list.length > this.size)
      this.list.pop();
    if (i < this.size)
      return i;
    else
      return -1;
  }

  loadFromStorage() {
    if (localStorage.sizeHOF !== undefined)
      this.size = JSON.parse(localStorage.sizeHOF);
    if (localStorage.listHOF !== undefined)
      this.list = JSON.parse(localStorage.listHOF);
  }

  saveToStorage() {
    localStorage.sizeHOF = JSON.stringify(this.size);
    localStorage.listHOF = JSON.stringify(this.list);
  }

  resetStorage() {
    localStorage.removeItem("sizeHOF");
    localStorage.removeItem("listHOF");
  }

  getSize() {
    return this.size;
  }

  setSize(thesize) {
    if (thesize !== undefined) {
      this.size = thesize;
      while (this.list.length > this.size)
        this.list.pop();
    }
  }

  // textos de la tabla
  displayOnStage(x, y, w, h) {
    let startY = y;
    let stepY = 30;

    if (this.list.length === 0) {
      let msgNoScore = game.add.text(
        game.world.centerX,
        startY,
        'No hay puntuaciones aún.',
        { font: '24px Arial', fill: '#ff0000', align: 'center' }
      );
      msgNoScore.anchor.set(0.5);
    } else {
      for (let i = 0; i < this.list.length; i++) {
        let entry = this.list[i];
        let pos = (i + 1).toString();
        let pts = entry.score.toString();
        let date = entry.date;

        // posición
        let posText = game.add.text(
          game.world.centerX - 190,
          startY + (i * stepY),
          pos,
          { font: '20px Arial', fill: '#ffdd00', align: 'right' }
        );
        posText.anchor.set(1, 0.5);

        // puntuacion
        let ptsText = game.add.text(
          game.world.centerX - 120,
          startY + (i * stepY),
          pts,
          { font: '20px Arial', fill: '#ffdd00', align: 'right' }
        );
        ptsText.anchor.set(1, 0.5);

        // fecha
        let dateText = game.add.text(
          game.world.centerX - 100,
          startY + (i * stepY),
          date,
          { font: '20px Arial', fill: '#ffdd00', align: 'left' }
        );
        dateText.anchor.set(0, 0.5);
      }
    }
  }
}

function ordinalNumAbbrev(n) {
  if (n > 0) {
    let last = n % 10;
    let remaining = Math.floor(n / 10);
    let nextToLast = remaining % 10;
    if (nextToLast === 1)
      return 'th';
    switch (last) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
  return '';
}

let tetrisHOF; // Instancia global

var hallFameState = {

  preload: function () {
    tetrisHOF = new HallOfFame();
    tetrisHOF.loadFromStorage();
  },

  create: function () {
    // desactivar HUD
    if (window.setDomHudVisible) window.setDomHudVisible(false);

    game.stage.backgroundColor = '#1c1400';

    // titulo
    var titulo = game.add.text(
      game.world.centerX,
      50,
      'Hall of Fame',
      { font: '48px KyotoTitle', fill: '#00FF00', align: 'center' }
    );
    titulo.anchor.set(0.5);

    let playerName = localStorage.getItem('playerName') || "Jugador";

    var nameText = game.add.text(
      game.world.centerX,
      100,
      'Jugador: ' + playerName,
      { font: '24px Arial', fill: '#ffffff', align: 'center' }
    );
    nameText.anchor.set(0.5);

    let msgUser = "";
    if (typeof score !== 'undefined' && !window.scoreSaved) {
      // Guardamos la puntuación si es mayor q 0 o si no hay ninguna aún
      if (score > 0 || tetrisHOF.list.length === 0) {
        let i = tetrisHOF.addNewScore(score, playerName);
        tetrisHOF.saveToStorage();
        if (i >= 0 && score > 0) {
          msgUser = "Congratulations! The " + (i + 1) + ordinalNumAbbrev(i + 1) + " place honours you.";
        }
      }
      window.scoreSaved = true;
    }

    tetrisHOF.displayOnStage(0, 160, game.world.width, game.world.height);

    // mensaje felicitacion
    if (msgUser !== "") {
      var congratsText = game.add.text(
        game.world.centerX,
        game.world.height - 110,
        msgUser,
        { font: '18px Arial', fill: '#00ffff', align: 'center' }
      );
      congratsText.anchor.set(0.5);
    }

    // botón menu
    var btnJugarOtraVez = game.add.text(
      game.world.centerX,
      game.world.height - 50,
      '[ MENU ]',
      { font: '26px MangaStyle', fill: '#ffdd00', align: 'center' }
    );
    btnJugarOtraVez.anchor.set(0.5);
    btnJugarOtraVez.inputEnabled = true;
    btnJugarOtraVez.events.onInputDown.add(function () {
      playSound('button2');
      window.menuMusicShouldRestart = true;
      game.state.start('Menu');
    }, this);
    btnJugarOtraVez.events.onInputOver.add(function () {
      btnJugarOtraVez.fill = '#ffffff';
    }, this);
    btnJugarOtraVez.events.onInputOut.add(function () {
      btnJugarOtraVez.fill = '#ffdd00';
    }, this);
  },

  update: function () {
  }
};
