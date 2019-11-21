const path = require('path');
const express = require('express');
const { default: SlippiGame } = require('slp-parser-js');
const app = express();

app.get('/replay', function(req, res) {
	// TODO: connect with database
	let filename = req.query.filename;
	console.log(path.join(__dirname, "replays/", filename));
	let game = new SlippiGame(path.join(__dirname, "replays/", filename));
	// game.getSettings();
	// game.getFrames();
	// game.getMetadata();
	let result = {
		"data": {
			"settings": game.getSettings(),
			"frames": game.getFrames(),
			"metadata": game.getMetadata()
		}
	};
	// console.log(game.getSettings());
	// console.log(game.getFrames());
	// console.log(game.getMetadata());
	res.send(result);
	console.log("Game sent");
});

app.use(express.static(path.join(__dirname, '../client')));

module.exports = app;