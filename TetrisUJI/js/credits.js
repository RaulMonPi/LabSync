// Credits screen

var creditsState = {

  preload: function () {
    // cargar assests que necesitemos
  },

  create: function () {
    if (window.setDomHudVisible) window.setDomHudVisible(false);
    stopMusic();

    // Background
    game.stage.backgroundColor = '#8B0000';

    // Title
    var titulo = game.add.text(
      game.world.centerX,
      game.world.centerY - 150,
      'CREDITS',
      { font: '36px KyotoTitle', fill: '#ffdd00', align: 'center' }
    );
    titulo.anchor.set(0.5);

    // Names
    var btnJugarOtraVez = game.add.text(
      game.world.centerX,
      game.world.centerY -40,
      'Shary Balbera Ubarnes',
      { font: '26px MangaStyle', fill: '#ffdd00', align: 'center' }
    );
    btnJugarOtraVez.anchor.set(0.5);

  
    var btnJugarOtraVez = game.add.text(
      game.world.centerX,
      game.world.centerY + 20,
      ' Luis De Quevedo Peña',
      { font: '26px MangaStyle', fill: '#ffdd00', align: 'center' }
    );
    btnJugarOtraVez.anchor.set(0.5);

  
    var btnJugarOtraVez = game.add.text(
      game.world.centerX,
      game.world.centerY + 80,
      ' Raul Montero Piñeiro ',
      { font: '26px MangaStyle', fill: '#ffdd00', align: 'center' }
    );
    btnJugarOtraVez.anchor.set(0.5);


    // Button to return to the menu
    var btnJugarOtraVez = game.add.text(
      game.world.centerX +90,
      game.world.centerY +230,
      '[ Menu ]',
      { font: '26px MangaStyle', fill: '#ffdd00', align: 'center' }
    );
    btnJugarOtraVez.anchor.set(0.5);
    btnJugarOtraVez.inputEnabled = true;
    btnJugarOtraVez.events.onInputDown.add(function () {
      playUiSound('button2');
      game.state.start('Menu');
    }, this);
    btnJugarOtraVez.events.onInputOver.add(function () { playUiSound('button1'); btnJugarOtraVez.fill = '#ffdd00'; }, this);
    btnJugarOtraVez.events.onInputOut.add(function () { btnJugarOtraVez.fill = '#ffffff'; }, this);
  },

  update: function () {
    // Por ahora no hace nada
  }

};
