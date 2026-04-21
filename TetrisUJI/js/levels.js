// Level selection screen

var levelsState = {

  preload: function () {
    // Aquí se cargarían los assets
  },

  create: function () {
    // Background
    game.stage.backgroundColor = '#8B0000';

    // Title
    var titulo = game.add.text(
      game.world.centerX,
      game.world.centerY -150,
      'LEVELS',
      { font: '36px KyotoTitle', fill: '#ffffff', align: 'center' }
    );
    titulo.anchor.set(0.5);

    // Level 1 goes to Game - for now it is just text
    var btnNivel1 = game.add.text(
      game.world.centerX,
      game.world.centerY - 40,
      '[ Level 1 ]',
      { font: '28px MangaStyle', fill: '#ffffff', align: 'center' }
    );
    btnNivel1.anchor.set(0.5);
    btnNivel1.inputEnabled = true;
    // Clickable button
    btnNivel1.events.onInputDown.add(function () {
      game.state.start('Game');
    }, this);
    // Hover effect
    btnNivel1.events.onInputOver.add(function () { btnNivel1.fill = '#ffdd00'; }, this);
    btnNivel1.events.onInputOut.add(function () { btnNivel1.fill = '#ffffff'; }, this);

    // Level 2 does not lead anywhere yet
    var btnNivel2 = game.add.text(
      game.world.centerX,
      game.world.centerY + 20,
      '[ Level 2 ]',
      { font: '28px MangaStyle', fill: '#888888', align: 'center' }
    );
    btnNivel2.anchor.set(0.5);
    btnNivel2.inputEnabled = true;
    btnNivel2.events.onInputDown.add(function () {
      // Placeholder: level not implemented yet
      console.log('Level 2 — coming soon');
    }, this);
    btnNivel2.events.onInputOver.add(function () { btnNivel2.fill = '#bbbbbb'; }, this);
    btnNivel2.events.onInputOut.add(function () { btnNivel2.fill = '#888888'; }, this);

    // Level 3 does not lead anywhere yet
    var btnNivel3 = game.add.text(
      game.world.centerX,
      game.world.centerY + 80,
      '[ Level 3 ]',
      { font: '28px MangaStyle', fill: '#888888', align: 'center' }
    );
    btnNivel3.anchor.set(0.5);
    btnNivel3.inputEnabled = true;
    btnNivel3.events.onInputDown.add(function () {
      // Placeholder: level not implemented yet
      console.log('Level 3 — coming soon');
    }, this);
    btnNivel3.events.onInputOver.add(function () { btnNivel3.fill = '#bbbbbb'; }, this);
    btnNivel3.events.onInputOut.add(function () { btnNivel3.fill = '#888888'; }, this);


    // Button that goes to the credits screen
    var btnCredits = game.add.text(
        game.world.centerX +90,
        game.world.centerY +230,
        'Credits',
        { font: '28px MangaStyle', fill: '#ffffff', align: 'center' }
      );
      btnCredits.anchor.set(0.5);
      btnCredits.inputEnabled = true;
      // Clickable button
      btnCredits.events.onInputDown.add(function () {
        game.state.start('credits');
      }, this);
      //efecto hover
      btnCredits.events.onInputOver.add(function () { btnCredits.fill = '#ffdd00'; }, this);
      btnCredits.events.onInputOut.add(function () { btnCredits.fill = '#ffffff'; }, this);


btnCredits.anchor.set(1, 1);
  },

  update: function () {
    // Vacío por ahora
  }

};
