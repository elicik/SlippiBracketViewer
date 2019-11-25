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
	let transform = function(sets, setid) {
		let set = sets.find(x => x.id.toString() === setid.toString());
		if (!set) {
			return null;
		}
		return {
			id: set.id,
			identifier: set.identifier,
			fullRoundText: set.fullRoundText,
			score0: set.slots[0].standing.stats.score.value,
			score1: set.slots[1].standing.stats.score.value,
			tag0: set.slots[0].entrant.name,
			tag1: set.slots[1].entrant.name,
			previous0: transform(sets, set.slots[0].prereqId),
			previous1: transform(sets, set.slots[1].prereqId)
		};
	};
	fetch("https://api.smash.gg/gql/alpha", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": `Bearer ${process.env.SMASHGG_KEY}`
		},
		body: JSON.stringify({
			query: `query TournamentQuery($slug: String) {
				tournament (slug: $slug) {
					events {
						id
						name
					}
				}
			}`,
			variables: { "slug": req.params.id },
		})
	})
	.then(data => data.json())
	.then(data => data.data.tournament.events.find(event => event.name === "Melee Singles").id)
	.then(data => fetch("https://api.smash.gg/gql/alpha", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": `Bearer ${process.env.SMASHGG_KEY}`
		},
		body: JSON.stringify({
			query: `query TournamentQuery($eventid: ID) {
				event(id: $eventid) {
					sets (page: 1, perPage: 500) {
						nodes {
							id
							identifier
							fullRoundText
							displayScore
							round
							slots {
								id
								standing {
									stats {
										score {
											value
										}
									}
								}
								entrant {
									name
								}
								prereqId
							}
						}
					}
				}
			}`,
			variables: { "eventid": data},
		})
	}))
	.then(data => data.json())
	.then(data => {
		let sets = data.data.event.sets.nodes;
		let maxround = Math.max(...sets.map(x => x.round));
		let grandsid = sets.find(x => x.round === maxround).id;
		return transform(sets, grandsid);
	})
	.then(data => res.send(data));
});


app.use(express.static(path.join(__dirname, "../client")));

module.exports = app;