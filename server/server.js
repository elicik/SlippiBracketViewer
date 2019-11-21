const path = require('path');
const express = require('express');
const { default: SlippiGame } = require('slp-parser-js');
const app = express();

app.get('/replay', function(req, res) {
	// TODO: connect with database
	let filename = req.query.filename;
	console.log(`Requested file: ${filename}`);
	let game = new SlippiGame(path.join(__dirname, "replays/", filename));
	let result = {
		"data": {
			"settings": game.getSettings(),
			"frames": game.getFrames(),
			"metadata": game.getMetadata()
		}
	};
	res.send(result);
	console.log("Game data sent to client");
});

app.use(express.static(path.join(__dirname, '../client')));

module.exports = app;