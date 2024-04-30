const http = require('http'),
      path = require('path'),
      express = require('express'),
      handlebars = require('express-handlebars'),
      socket = require('socket.io');

const config = require('../config');

const myIo = require('./sockets/io'), //import the Socket.IO setups
      routes = require('./routes/routes'); //import the client routes setup

const app = express(),
      server = http.Server(app),
      io = socket(server);

server.listen(config.port);

games = {};

myIo(io); //initializes the Socket.io handling for the
// socket connection that connects to the server

console.log(`Server listening on port ${config.port}`);

const Handlebars = handlebars.create({
  extname: '.html', 
  partialsDir: path.join(__dirname, '..', 'front', 'views', 'partials'), 
  defaultLayout: false,
  helpers: {}
});
app.engine('html', Handlebars.engine);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '..', 'front', 'views'));
app.use('/public', express.static(path.join(__dirname, '..', 'front', 'public')));

routes(app); //Set up client routes
// this is the same as just putting the routes in this file