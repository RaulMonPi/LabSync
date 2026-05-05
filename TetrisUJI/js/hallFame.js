// Hall of Fame screen

var hallFameState = {

  preload: function () {
    // Cargar los assets si es necesario
  },

  create: function () {
    // Desactivar HUD
    if (window.setDomHudVisible) window.setDomHudVisible(false);
    stopMusic();

    // Fondo de la pantalla del Hall of Fame
    game.stage.backgroundColor = '#1c1400';

    // Título "Hall of Fame", centrado
    var titulo = game.add.text(
      game.world.centerX,
      50,
      'Hall of Fame',
      { font: '48px KyotoTitle', fill: '#00FF00', align: 'center' }
    );
    titulo.anchor.set(0.5);

    // Obtener el nombre del jugador
    let playerName = localStorage.getItem('playerName') || "Jugador";

    // Mostrar nombre del jugador
    var nameText = game.add.text(
      game.world.centerX,
      100,
      'Jugador: ' + playerName,
      { font: '24px Arial', fill: '#ffffff', align: 'center' }
    );
    nameText.anchor.set(0.5);

    // Obtener y actualizar Highscores
    let highscores = JSON.parse(localStorage.getItem('tetris_highscores')) || [];

    if (typeof score !== 'undefined' && !window.scoreSaved) {
      // Guardar puntuación si es > 0 o si no hay ninguna
      if (score > 0 || highscores.length === 0) {
        highscores.push({
          score: score,
          date: new Date().toUTCString(),
          name: playerName
        });
      }
      window.scoreSaved = true;
      
      // Ordenar por puntuación descendente
      highscores.sort(function(a, b) {
        return b.score - a.score;
      });
      
      // Quedarse con los mejores 10
      highscores = highscores.slice(0, 10);
      
      localStorage.setItem('tetris_highscores', JSON.stringify(highscores));
    }

    // Mostrar tabla
    let startY = 160;
    let stepY = 30;

    if (highscores.length === 0) {
      let msgNoScore = game.add.text(
        game.world.centerX,
        startY,
        'No hay puntuaciones aún.',
        { font: '24px Arial', fill: '#ff0000', align: 'center' }
      );
      msgNoScore.anchor.set(0.5);
    } else {
      for (let i = 0; i < highscores.length; i++) {
        let entry = highscores[i];
        let pos = (i + 1).toString();
        let pts = entry.score.toString();
        let date = entry.date;
        
        // Posición (alineado a la derecha)
        let posText = game.add.text(
          game.world.centerX - 150,
          startY + (i * stepY),
          pos,
          { font: '20px Arial', fill: '#ffdd00', align: 'right' }
        );
        posText.anchor.set(1, 0.5);

        // Puntuación (alineado a la derecha)
        let ptsText = game.add.text(
          game.world.centerX - 60,
          startY + (i * stepY),
          pts,
          { font: '20px Arial', fill: '#ffdd00', align: 'right' }
        );
        ptsText.anchor.set(1, 0.5);

        // Fecha (alineado a la izquierda)
        let dateText = game.add.text(
          game.world.centerX - 20,
          startY + (i * stepY),
          date,
          { font: '20px Arial', fill: '#ffdd00', align: 'left' }
        );
        dateText.anchor.set(0, 0.5);
      }
    }

    // Mensaje de felicitación
    if (typeof score !== 'undefined' && highscores.length > 0 && score === highscores[0].score && score > 0) {
       var congratsText = game.add.text(
         game.world.centerX,
         game.world.height - 120,
         '¡Felicidades! Has conseguido el 1º puesto.',
         { font: '22px Arial', fill: '#00ffff', align: 'center' }
       );
       congratsText.anchor.set(0.5);
    }

    // Botón [ MENU ], centrado abajo
    var btnJugarOtraVez = game.add.text(
      game.world.centerX,
      game.world.height - 60,
      '[ MENU ]',
      { font: '26px MangaStyle', fill: '#ffdd00', align: 'center' }
    );
    btnJugarOtraVez.anchor.set(0.5);
    btnJugarOtraVez.inputEnabled = true;
    btnJugarOtraVez.events.onInputDown.add(function () {
      playUiSound('button2');
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
