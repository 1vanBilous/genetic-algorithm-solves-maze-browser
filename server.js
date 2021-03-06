const express = require('express');
const app = express();

app.use('/src', express.static(__dirname + '/src'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(8000, () => {
  console.log('The server is up and running!');
});
