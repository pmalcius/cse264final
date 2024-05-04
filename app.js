const express = require("express");
const path = require("path");
const app = express();
const handlebars = require('express-handlebars');
const socketClient = require('socket.io-client');
const serverSocket = socketClient.connect('http://mars.cse.lehigh.edu:9090');

// Setup middleware
const Handlebars = handlebars.create({
  extname: '.html', 
  defaultLayout: false,
  helpers: {}
});

app.engine('html', Handlebars.engine);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'public', 'views'));
app.use(express.static(
    path.resolve(__dirname, "public")
));

// Setup routes
app.get('/', (req, res) => {
    res.render('index.html');
});

app.get('/white', (req, res) => {
    res.render('game.html', {
        color: 'white'
    });
});
app.get('/black', (req, res) => {

    // Need to validate code with game server
    serverSocket.emit('validateCode', req.query.code, (isValid) => {
        if (!isValid) {
            return res.redirect('/?error=invalidCode');
        }
        res.render('game.html', {
            color: 'black'
        });
    });
});
app.listen(3000, () => console.log("Starting Chess Client"));