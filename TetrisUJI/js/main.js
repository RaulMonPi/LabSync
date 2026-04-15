// states(pantallas) el main último en arrancar
let game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'game');

    google: {
game.state.add('Splash', splashState);
game.state.add('Levels', levelsState);
game.state.add('Game', gameState);
game.state.add('HallFame', hallFameState);
game.state.add('credits', creditsState);

game.state.start('Splash');
