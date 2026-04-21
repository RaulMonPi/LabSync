var menuState = {
    preload: function () {
    },

    create: function () {
        game.stage.backgroundColor = '#8B0000';

        var nombreJugador = localStorage.getItem('playerName') || window.playerName || 'Jugador';

        var titulo = game.add.text(
            game.world.centerX,
            game.world.centerY - 150,
            'MENU',
            { font: '44px KyotoTitle', fill: '#ffffff', align: 'center' }
        );
        titulo.anchor.set(0.5);

        var subtitulo = game.add.text(
            game.world.centerX,
            game.world.centerY - 105,
            'PLAYER: ' + nombreJugador,
            { font: '18px MangaStyle', fill: '#f3d9b1', align: 'center' }
        );
        subtitulo.anchor.set(0.5);

        function createMenuButton(label, y, onClick) {
            var btn = game.add.text(
            game.world.centerX,
            y,
            label,
            { font: '28px MangaStyle', fill: '#ffffff', align: 'center' }
            );
            btn.anchor.set(0.5);
            btn.inputEnabled = true;
            btn.events.onInputDown.add(onClick, this);
            btn.events.onInputOver.add(function () { btn.fill = '#ffdd00'; }, this);
            btn.events.onInputOut.add(function () { btn.fill = '#ffffff'; }, this);
            return btn;
        }

        createMenuButton('[ PLAY ]', game.world.centerY - 20, function () {
            game.state.start('Levels');
        });

        createMenuButton('[ CREDITS ]', game.world.centerY + 40, function () {
            game.state.start('credits');
        });

        createMenuButton('[ HALL OF FAME ]', game.world.centerY + 100, function () {
            game.state.start('HallFame');
        });
    },

    update: function () {
    }
};