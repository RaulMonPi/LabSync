let game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'game');

let wfConfig = {
    active: function () {
        startGame();
    },

    google: {
        families: ['Rammetto One', 'Sniglet']
    },

    custom: {
        // Your Turn 3
        families: ['FerrumExtracondensed'],
        urls: ["https://fontlibrary.org/face/ferrum"]
    }
};

WebFont.load(wfConfig);

game.state.add('Game', gameState);
game.state.start('Game');
