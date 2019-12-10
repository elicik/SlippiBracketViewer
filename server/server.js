require("dotenv").config();
const path = require("path");
const express = require("express");
const fetch = require("node-fetch");
const { default: SlippiGame } = require("slp-parser-js");

const app = express();


app.get("/replay", function(req, res) {
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

app.get("/tournament-info/:id", function(req, res) {
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
					name
					images (type: "profile") {
						url
						type
					}
				}
			}`,
			variables: { "slug": req.params.id },
		})
	})
	.then(data => data.json())
	.then(data => res.send({ name: data.data.tournament.name, profile: data.data.tournament.images.find(img => img.type === "profile").url}));
});

app.get("/tournament/:id", function(req, res) {
	let transform = function(sets, setid) {
		let set = sets.find(x => x.id.toString() === setid.toString());
		if (!set) {
			return null;
		}
		let losersFinalRound = Math.min(...sets.map(x => x.round));
		let winnersFinalRound = Math.max(...sets.map(x => x.round));
		let prev0set = sets.find(x => x.id.toString() === set.slots[0].prereqId.toString());
		let prev1set = sets.find(x => x.id.toString() === set.slots[1].prereqId.toString());
		let prev0obj = null;
		let prev1obj = null;
		if (set.round > 0) {
			if (prev0set && (prev0set.round > 0 || prev0set.round === losersFinalRound)) {
				prev0obj = transform(sets, set.slots[0].prereqId);
			}
			if (prev1set && (prev1set.round > 0 || prev1set.round === losersFinalRound)) {
				prev1obj = transform(sets, set.slots[1].prereqId);
			}
		}
		if (set.round < 0) {
			if (prev0set && (prev0set.round < 0)) {
				prev0obj = transform(sets, set.slots[0].prereqId);
			}
			if (prev1set && (prev1set.round < 0)) {
				prev1obj = transform(sets, set.slots[1].prereqId);
			}
		}

		return {
			id: set.id,
			identifier: set.identifier,
			fullRoundText: set.fullRoundText,
			score0: set.slots[0].standing.stats.score.value,
			score1: set.slots[1].standing.stats.score.value,
			tag0: set.slots[0].entrant.name,
			tag1: set.slots[1].entrant.name,
			previous0: prev0obj,
			previous1: prev1obj
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
		let minround = Math.min(...sets.map(x => x.round));
		let grandsid = sets.find(x => x.round === maxround).id;
		return transform(sets, grandsid);
	})
	.then(data => res.send(data));
});


app.use(express.static(path.join(__dirname, "../client")));

module.exports = app;