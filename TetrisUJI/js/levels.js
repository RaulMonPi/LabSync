// Pantalla de selección de nivel

var levelsState = {

  preload: function () {
    // Aquí se cargarían los assets
  },

  create: function () {
    //el fondo
    game.stage.backgroundColor = '#8B0000';

    // Título
    var titulo = game.add.text(
      game.world.centerX,
      game.world.centerY -150,
      'LEVELS',
      { font: '36px KyotoTitle', fill: '#ffffff', align: 'center' }
    );
    titulo.anchor.set(0.5);

    //  Nivel 1 lleva a  Game - de momento es tipo texto
    var btnNivel1 = game.add.text(
      game.world.centerX,
      game.world.centerY - 40,
      '[ Level 1 ]',
      { font: '28px MangaStyle', fill: '#ffffff', align: 'center' }
    );
    btnNivel1.anchor.set(0.5);
    btnNivel1.inputEnabled = true;
    //botón clicable
    btnNivel1.events.onInputDown.add(function () {
      game.state.start('Game');
    }, this);
    //efecto hover
    btnNivel1.events.onInputOver.add(function () { btnNivel1.fill = '#ffffff'; }, this);
    btnNivel1.events.onInputOut.add(function () { btnNivel1.fill = '#ffdd00'; }, this);

    // Nivel 2 de momento no llevan a ningún nivel
    var btnNivel2 = game.add.text(
      game.world.centerX,
      game.world.centerY + 20,
      '[ Level 2 ]',
      { font: '28px MangaStyle', fill: '#888888', align: 'center' }
    );
    btnNivel2.anchor.set(0.5);
    btnNivel2.inputEnabled = true;
    btnNivel2.events.onInputDown.add(function () {
      // Placeholder: nivel no implementado aún
      console.log('Leve 2 — próximamente');
    }, this);
    btnNivel2.events.onInputOver.add(function () { btnNivel2.fill = '#bbbbbb'; }, this);
    btnNivel2.events.onInputOut.add(function () { btnNivel2.fill = '#888888'; }, this);

    // Nivel 3 de momento no llevan a ningún nivel
    var btnNivel3 = game.add.text(
      game.world.centerX,
      game.world.centerY + 80,
      '[ Level 3 ]',
      { font: '28px MangaStyle', fill: '#888888', align: 'center' }
    );
    btnNivel3.anchor.set(0.5);
    btnNivel3.inputEnabled = true;
    btnNivel3.events.onInputDown.add(function () {
      // Placeholder: nivel no implementado aún
      console.log('Nivel 3 — próximamente');
    }, this);
    btnNivel3.events.onInputOver.add(function () { btnNivel3.fill = '#bbbbbb'; }, this);
    btnNivel3.events.onInputOut.add(function () { btnNivel3.fill = '#888888'; }, this);


    //boton que lleva a la pantalla de creditos
    var btnCredits = game.add.text(
        game.world.centerX +90,
        game.world.centerY +230,
        'Credits',
        { font: '28px MangaStyle', fill: '#ffffff', align: 'center' }
      );
      btnCredits.anchor.set(0.5);
      btnCredits.inputEnabled = true;
      //botón clicable
      btnCredits.events.onInputDown.add(function () {
        game.state.start('credits');
      }, this);
      //efecto hover
      btnCredits.events.onInputOver.add(function () { btnNivel1.fill = '#ffffff'; }, this);
      btnCredits.events.onInputOut.add(function () { btnNivel1.fill = '#ffdd00'; }, this);


btnCredits.anchor.set(1, 1);
  },

  update: function () {
    // Vacío por ahora
  }

};
