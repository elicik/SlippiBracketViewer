const path = require('path');
const express = require('express');
const { default: SlippiGame } = require('slp-parser-js');
const app = express();

// app.get('/', function(req, res) {
// 	res.send("Hello world!");
// });

app.use(express.static(path.join(__dirname, '../client')));

module.exports = app;