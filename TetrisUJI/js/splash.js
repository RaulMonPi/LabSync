//  Pantalla de bienvenida

var splashState = {

  preload: function () {
    // Aquí se cargarían assets si los hubiera
  },

  create: function () {
    // Fondo rojo oscuro
    game.stage.backgroundColor = '#8B0000';

    // Título
    var titulo = game.add.text(
      game.world.centerX,
      game.world.centerY - 60,
      'KYOTETRIS',
      { font: '48px KyotoTitle', fill: '#ffffff', align: 'center' }
    );
    titulo.anchor.set(0.5);

    // Botón de texto "JUGAR"
    var btnJugar = game.add.text(
      game.world.centerX,
      game.world.centerY + 40,
      '[ JUGAR ]',
      { font: '28px MangaStyle', fill: '#ffffff', align: 'center' }
    );
    btnJugar.anchor.set(0.5);

    // Hacer el texto interactivo 
    btnJugar.inputEnabled = true;
    btnJugar.events.onInputDown.add(function () {
      game.state.start('Levels');
    }, this);

    // Efecto hover(cuando entramos en la pantalal cambia de color )
    btnJugar.events.onInputOver.add(function () {
      btnJugar.fill = '#ffdd00';
    }, this);
    btnJugar.events.onInputOut.add(function () {
      btnJugar.fill = '#ffffff';
    }, this);
  },

  update: function () {
    // no tenemos funciones por ahora
  }

};
