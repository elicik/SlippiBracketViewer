const app = require('./server/server.js');

var port = process.env.PORT || 3000;

app.listen(port);
console.log(`Server now running on port ${port}`);