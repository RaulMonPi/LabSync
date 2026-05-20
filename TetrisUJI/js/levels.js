var levelsState = {

  preload: function () {
  },

  create: function () {
    if (window.setDomHudVisible) window.setDomHudVisible(false);
    stopMusic();
    game.stage.backgroundColor = '#8B0000';

    var titulo = game.add.text(
      game.world.centerX,
      game.world.centerY -150,
      'LEVELS',
      { font: '36px KyotoTitle', fill: '#ffffff', align: 'center' }
    );
    titulo.anchor.set(0.5);

    var btnNivel1 = game.add.text(
      game.world.centerX,
      game.world.centerY - 40,
      '[ Level 1 ]',
      { font: '28px MangaStyle', fill: '#ffffff', align: 'center' }
    );
    btnNivel1.anchor.set(0.5);
    btnNivel1.inputEnabled = true;
    btnNivel1.events.onInputDown.add(function () {
      window.selectedLevelKey = 'level1';
      playSound('button2');
      game.state.start('Game');
    }, this);
    btnNivel1.events.onInputOver.add(function () { playSound('button1'); btnNivel1.fill = '#ffdd00'; }, this);
    btnNivel1.events.onInputOut.add(function () { btnNivel1.fill = '#ffffff'; }, this);

    var btnNivel2 = game.add.text(
      game.world.centerX,
      game.world.centerY + 20,
      '[ Level 2 ]',
      { font: '28px MangaStyle', fill: '#ffffff', align: 'center' }
    );
    btnNivel2.anchor.set(0.5);
    btnNivel2.inputEnabled = true;
    btnNivel2.events.onInputDown.add(function () {
      window.selectedLevelKey = 'level2';
      playSound('button2');
      game.state.start('Game');
    }, this);
    btnNivel2.events.onInputOver.add(function () { playSound('button1'); btnNivel2.fill = '#ffdd00'; }, this);
    btnNivel2.events.onInputOut.add(function () { btnNivel2.fill = '#ffffff'; }, this);

    var btnNivel3 = game.add.text(
      game.world.centerX,
      game.world.centerY + 80,
      '[ Level 3 ]',
      { font: '28px MangaStyle', fill: '#ffffff', align: 'center' }
    );
    btnNivel3.anchor.set(0.5);
    btnNivel3.inputEnabled = true;
    btnNivel3.events.onInputDown.add(function () {
      window.selectedLevelKey = 'level3';
      playSound('button2');
      game.state.start('Game');
    }, this);
    btnNivel3.events.onInputOver.add(function () { playSound('button1'); btnNivel3.fill = '#ffdd00'; }, this);
    btnNivel3.events.onInputOut.add(function () { btnNivel3.fill = '#ffffff'; }, this);


    var btnCredits = game.add.text(
        game.world.centerX +90,
        game.world.centerY +230,
        'Credits',
        { font: '28px MangaStyle', fill: '#ffffff', align: 'center' }
      );
      btnCredits.anchor.set(0.5);
      btnCredits.inputEnabled = true;
      btnCredits.events.onInputDown.add(function () {
        playSound('button2');
        game.state.start('credits');
      }, this);
      btnCredits.events.onInputOver.add(function () { playSound('button1'); btnCredits.fill = '#ffdd00'; }, this);
      btnCredits.events.onInputOut.add(function () { btnCredits.fill = '#ffffff'; }, this);


    btnCredits.anchor.set(1, 1);
  },

};
