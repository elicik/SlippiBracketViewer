require("dotenv").config();
const path = require("path");
const express = require("express");
const fetch = require("node-fetch");
const { default: SlippiGame } = require("slp-parser-js");

const app = express();


app.get("/replay", function(req, res) {
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

app.get("/tournament/:id", function(req, res) {
	let query1 = `query TournamentQuery($slug: String) {
		tournament (slug: $slug) {
			events {
				id
				name
			}
		}
	}`;
	let query2 = `query TournamentQuery($eventid: ID) {
		event(id: $eventid) {
			sets (page: 1, perPage: 500) {
				nodes {
					id
					fullRoundText
					displayScore
					round
					slots {
						id
						entrant {
							name
						}
						prereqId
					}
				}
			}
		}
	}`;
	fetch("https://api.smash.gg/gql/alpha", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": `Bearer ${process.env.SMASHGG_KEY}`
		},
		body: JSON.stringify({
			query: query1,
			variables: { "slug": req.params.id },
		})
	})
	.then(data => data.json())
	.then(data => data["data"]["tournament"]["events"].find(event => event["name"] === "Melee Singles")["id"])
	.then((data) => fetch("https://api.smash.gg/gql/alpha", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": `Bearer ${process.env.SMASHGG_KEY}`
		},
		body: JSON.stringify({
			query: query2,
			variables: { "eventid": data},
		})
	}))
	.then(data => data.json())
	.then(data => res.send(data));
	// .then(data => {

	// })
});

app.use(express.static(path.join(__dirname, "../client")));

module.exports = app;