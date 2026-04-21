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
      'Enter your name',
      { font: '22px MangaStyle', fill: '#f3d9b1', align: 'center' }
    );
    subtitulo.anchor.set(0.5);

    var ayuda = game.add.text(
      game.world.centerX,
      game.world.centerY + 95,
      'Press ENTER to continue',
      { font: '18px MangaStyle', fill: '#ffffff', align: 'center' }
    );
    ayuda.anchor.set(0.5);

    var inputNombre = document.createElement('input');
    inputNombre.type = 'text';
    inputNombre.maxLength = 16;
    inputNombre.placeholder = 'Player';
    inputNombre.value = localStorage.getItem('playerName') || '';
    inputNombre.autocomplete = 'off';

    inputNombre.className = 'splash-name-input';

    document.body.appendChild(inputNombre);

    var canvasRect = game.canvas.getBoundingClientRect();
    var inputRect = inputNombre.getBoundingClientRect();
    //Ajuste altura caja Nombre
    inputNombre.style.top = (canvasRect.top + game.world.centerY + 70 - (inputNombre.offsetHeight / 2)) + 'px';

    var startMenu = function () {
      var nombre = inputNombre.value.trim();
      if (nombre === '') nombre = 'Player';

      localStorage.setItem('playerName', nombre);
      window.playerName = nombre;

      if (inputNombre.parentNode) inputNombre.parentNode.removeChild(inputNombre);
      game.state.start('Menu');
    };

    this.enterHandler = function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        startMenu();
      }
    };

    document.addEventListener('keydown', this.enterHandler);

    inputNombre.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        startMenu();
      }
    });

    inputNombre.addEventListener('blur', function () {
      if (!inputNombre.value.trim()) inputNombre.value = 'Player';
    });

    this.nameInput = inputNombre;
  },

  shutdown: function () {
    if (this.enterHandler) {
      document.removeEventListener('keydown', this.enterHandler);
      this.enterHandler = null;
    }

    if (this.nameInput && this.nameInput.parentNode) {
      this.nameInput.parentNode.removeChild(this.nameInput);
    }
  },

  update: function () {
    // no tenemos nada por ahora
  }
};