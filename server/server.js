const HOST = process.argv[2];
const PORT = process.argv[3];

const http = require('http'),
      path = require('path'),
      express = require('express'),
      handlebars = require('express-handlebars'),
      socket = require('socket.io');

const app = express(),
      server = http.Server(app),
      io = socket(server);

const localPort = 3000; //Port for localhosting
server.listen(localPort, () => { console.log('server running locally')}); // LOCAL HOSTING ON PORT 3000

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
        
        currentCode = data.code;
        socket.join(currentCode);
        if (!games[currentCode]) {
            timeInterval = data.time;
            games[currentCode] = true;
            return;
        }
        
        io.to(currentCode).emit('startGame', timeInterval);
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

    // Add chat function here
    socket.on('message', (message) => {
        console.log(message);
        io.emit('message', `${message}`);
    });
});


// Listen for connections on PORT
//server.listen(PORT, HOST, () => { console.log(`Server running at http://${HOST}:${PORT}/`); });

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


