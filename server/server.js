const HOST = process.argv[2];
const PORT = process.argv[3];

const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const { Server } = require('socket.io');

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});
// const app = express();
// const http = require('http'),
//       path = require('path'),
//       express = require('express'),
//       //handlebars = require('express-handlebars'),
//       socket = require('socket.io');

// const app = express(),
//       server = http.Server(app),
//       io = socket(server);

const localPort = 3001; // Port for localhosting
server.listen(localPort, 'localhost', () => { console.log('server running locally on port 3001')});

games = {};

// Socket IO Setup:
let timeInterval = 0;
io.on('connection', socket => {
    console.log('New socket connection');

    let currentCode = null;
    
    socket.on('move', function(move) {
        console.log('move detected')

        io.to(currentCode).emit('newMove', move);
    });
    
    socket.on('joinGame', function(data) {
      console.log('Someone joined a game')
      currentCode = data.code;
      socket.join(currentCode);
      if (!games[currentCode]) { // create a entry in the games map an set it to true
          timeInterval = data.time;
          games[currentCode] = true;
          return;
      }
      io.to(currentCode).emit('startGame', timeInterval);
    });

    // Route to retrieve if a game is valid
    // Listen for game code validation requests
    socket.on('validateCode', (code, callback) => {
      const isValid = games.hasOwnProperty(code);
      callback(isValid);  // Respond back to `app.js`
    });

    socket.on('disconnect', function() {
        console.log('socket disconnected');

        if (currentCode) {
            io.to(currentCode).emit('gameOverDisconnect');
            delete games[currentCode];
        }
    });

    socket.on('timeout', function() {
        console.log('clock timeout');
        if (currentCode) {
            io.to(currentCode).emit('gameOverTimeout');
        }
    });
});

/*
Listen for connections on PORT
server.listen(PORT, HOST, () => { console.log(`Server running at http://${HOST}:${PORT}/`); });

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

// Setup routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/white', (req, res) => {
  res.render('game', {
      color: 'white'
  });
});
app.get('/black', (req, res) => {
  if (!games[req.query.code]) {
      return res.redirect('/?error=invalidCode');
  }

  res.render('game', {
      color: 'black'
  });
});
*/

