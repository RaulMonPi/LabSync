var splashState = {
  preload: function () {
  },

  create: function () {
    if (window.setDomHudVisible) window.setDomHudVisible(false);

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
    inputNombre.className = 'splash-name-input';

    document.body.appendChild(inputNombre);

    var canvasRect = game.canvas.getBoundingClientRect();
    inputNombre.style.top = (canvasRect.top + game.world.centerY + 70 - inputNombre.offsetHeight / 2) + 'px';

    this.nameInput = inputNombre;
  },

  update: function () {
    if (this.nameInput && game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
      var nombre = this.nameInput.value.trim();

      if (nombre === '') {
        nombre = 'Player';
      }

      localStorage.setItem('playerName', nombre);
      window.playerName = nombre;

      if (this.nameInput.parentNode) {
        this.nameInput.parentNode.removeChild(this.nameInput);
      }

      this.nameInput = null;
      game.state.start('Menu');
    }
  }
};