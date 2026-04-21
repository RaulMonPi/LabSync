// states(pantallas) el main último en arrancar
let game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'game');

game.state.add('Splash', splashState);
game.state.add('Menu', menuState);
game.state.add('Levels', levelsState);
game.state.add('Game', gameState);
game.state.add('HallFame', hallFameState);
game.state.add('credits', creditsState);

function startGame() {
	game.state.start('Splash');
}

if (document.fonts && document.fonts.load) {
	Promise.all([
		document.fonts.load('48px KyotoTitle'),
		document.fonts.load('22px MangaStyle'),
		document.fonts.load('18px MangaStyle'),
		document.fonts.load('28px MangaStyle')
	]).then(startGame).catch(startGame);
} else {
	window.setTimeout(startGame, 100);
}
