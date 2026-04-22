
let game;

window.onload = function () {

    // crear juego
    game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'game');

    // añadir states (pantallas)
    game.state.add('Splash', splashState);
    game.state.add('Menu', menuState);
    game.state.add('Levels', levelsState);
    game.state.add('Game', gameState);
    game.state.add('HallFame', hallFameState);
    game.state.add('credits', creditsState);

    // iniciar juego
    game.state.start('Splash');
};