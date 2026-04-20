var splashState = {
  preload: function () {
  },

  create: function () {
    game.stage.backgroundColor = '#8B0000';

    var titulo = game.add.text(
      game.world.centerX,
      game.world.centerY - 120,
      'KYOTETRIS',
      { font: '48px KyotoTitle', fill: '#ffffff', align: 'center' }
    );
    titulo.anchor.set(0.5);

    var subtitulo = game.add.text(
      game.world.centerX,
      game.world.centerY - 35,
      'Introduce tu nombre',
      { font: '22px MangaStyle', fill: '#f3d9b1', align: 'center' }
    );
    subtitulo.anchor.set(0.5);

    var inputNombre = document.createElement('input');
    inputNombre.type = 'text';
    inputNombre.maxLength = 16;
    inputNombre.placeholder = 'Jugador';
    inputNombre.value = localStorage.getItem('playerName') || '';
    inputNombre.autocomplete = 'off';

    inputNombre.className = 'splash-name-input';

    document.body.appendChild(inputNombre);

    var btnJugar = game.add.text(
      game.world.centerX,
      game.world.centerY + 70,
      '[ JUGAR ]',
      { font: '28px MangaStyle', fill: '#ffffff', align: 'center' }
    );
    btnJugar.anchor.set(0.5);
    btnJugar.inputEnabled = true;

    btnJugar.events.onInputOver.add(function () {
      btnJugar.fill = '#f3d9b1';
    });

    btnJugar.events.onInputOut.add(function () {
      btnJugar.fill = '#ffffff';
    });

    btnJugar.events.onInputDown.add(function () {
      var nombre = inputNombre.value.trim();
      if (nombre === '') nombre = 'Jugador';

      localStorage.setItem('playerName', nombre);
      window.playerName = nombre;

      if (inputNombre.parentNode) inputNombre.parentNode.removeChild(inputNombre);
      game.state.start('Levels');
    });

    this.nameInput = inputNombre;
  },

  shutdown: function () {
    if (this.nameInput && this.nameInput.parentNode) {
      this.nameInput.parentNode.removeChild(this.nameInput);
    }
  },

  update: function () {
    // no tenemos nada por ahora
  }
};