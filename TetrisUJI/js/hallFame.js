// Hall of Fame screen

var hallFameState = {

  preload: function () {
    // cargar assests que necesitemos
  },

  create: function () {
    if (window.setDomHudVisible) window.setDomHudVisible(false);

    // Background
    game.stage.backgroundColor = '#1c1400';

    // Title
    var titulo = game.add.text(
      game.world.centerX,
      game.world.centerY - 20,
      'HALL OF FAME',
      { font: '36px KyotoTitle', fill: '#ffdd00', align: 'center' }
    );
    titulo.anchor.set(0.5);

    // Button to return to the menu
    var btnJugarOtraVez = game.add.text(
      game.world.centerX,
      game.world.centerY + 60,
      '[ MENU ]',
      { font: '26px MangaStyle', fill: '#ffdd00', align: 'center' }
    );
    btnJugarOtraVez.anchor.set(0.5);
    btnJugarOtraVez.inputEnabled = true;
    btnJugarOtraVez.events.onInputDown.add(function () {
      game.state.start('Menu');
    }, this);
    btnJugarOtraVez.events.onInputOver.add(function () { btnJugarOtraVez.fill = '#ffffff'; }, this);
    btnJugarOtraVez.events.onInputOut.add(function () { btnJugarOtraVez.fill = '#ffdd00'; }, this);
  },

  update: function () {
    // Por ahora no hace nada
  }

};
