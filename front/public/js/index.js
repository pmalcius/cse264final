
let gameHasStarted = false;
var board = null;
var game = new Chess();
var $status = $('#status');
var $pgn = $('#pgn');
var $blackClock = $('#blackClock');
var $whiteClock = $('#whiteClock');
var blackTimer;
var whiteTimer;
let gameOver = false;
var timeout = false;

// Display is the jquery element for each clock
// start timer starts a timer for a display
function Timer(duration, display) {
    this.duration = duration; //stores the duration argument
    this.timer = duration; //stores the current duration
    this.interval = null;
    this.display = display;
    this.isPaused = true;

    this.updateDisplay = function() {
        let minutes = parseInt(this.timer / 60, 10);
        let seconds = parseInt(this.timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        this.display.html(minutes + ":" + seconds);
    };

    this.start = function() { //unpause the timer if paused
        if (this.isPaused) {
            this.isPaused = false;
            this.interval = setInterval(() => {
                if (--this.timer <= 0) {
                    clearInterval(this.interval); //stops the interval and sets isPaused to true
                    this.isPaused = true;
                    timeout=true;
                    socket.emit('timeout');
                }
                this.updateDisplay();
            }, 1000);
        }
    }

    this.pause = function() {
        if (!this.isPaused) {
            clearInterval(this.interval); //stops the interval and sets isPaused to true
            this.isPaused = true;
        }
    };

    this.resume = function() { //calls start if isPaused is true
        if (this.isPaused) {
            this.start();
        }
    };

    this.reset = function() { //resets the timer to original duration (not necessary)
        this.timer = this.duration;
        this.updateDisplay();
    };
}

function initializeTimers(timeMin) {
    blackTimer = new Timer(60*timeMin, $blackClock);
    whiteTimer = new Timer(60*timeMin, $whiteClock);
    blackTimer.updateDisplay();
    whiteTimer.updateDisplay();
}

function onDragStart (source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.game_over()) return false
    if (!gameHasStarted) return false;
    if (gameOver) return false;

    if ((playerColor === 'black' && piece.search(/^w/) !== -1) || (playerColor === 'white' && piece.search(/^b/) !== -1)) {
        return false;
    }

    // only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) || (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false
    }
}

function onDrop (source, target) {
    let theMove = {
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for simplicity
    };
    // see if the move is legal
    var move = game.move(theMove);


    // illegal move
    if (move === null) return 'snapback'

    socket.emit('move', theMove);

    updateStatus();
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
    board.position(game.fen())
}

function updateStatus () {
    var status = '';

    var moveColor = 'White';
    if (game.turn() === 'b') {
        moveColor = 'Black';
    }

    // checkmate?
    if (game.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.';
        blackTimer.pause();
        whiteTimer.pause();
    }

    // draw?
    else if (game.in_draw()) {
        status = 'Game over, drawn position';
    }

    else if (gameOver) {
        if(timeout) {
            status = `${moveColor} ran out of time`;
        } else {
            status = 'Opponent disconnected, you win!';
        } 
    }


    else if (!gameHasStarted) {
        status = 'Waiting for black to join';
    }

    // game still on
    else {
        status = moveColor + ' to move'

        // check?
        if (game.in_check()) {
            status += ', ' + moveColor + ' is in check'
        }
        // insert the call to start moveColor's timer and pause the other timer
        if(moveColor === 'White') {
            whiteTimer.resume();
            blackTimer.pause();
        } else if(moveColor === 'Black') {
            whiteTimer.pause();
            blackTimer.resume();
        }
    }

    $status.html(status)
    // Update PGN display to format moves correctly
    var pgn = game.pgn({ max_width: 5, newline_char: '<br>' }); // Use Chess.js's options to format PGN
    var formattedPgn = pgn.replace(/\d+\./g, function(match) {
        return '<div>' + match; // Start a new div for each move number
    });
    formattedPgn = formattedPgn.replace(/<br>/g, '</div>'); // Close the div at each new line

    $pgn.html(formattedPgn);

    // Scroll to the bottom of the moves list
    var movesScrollable = $('#moves-scrollable');
    movesScrollable.scrollTop(movesScrollable.prop('scrollHeight'));
}

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: '/public/img/chesspieces/wikipedia/{piece}.png'
}
board = Chessboard('myBoard', config)
if (playerColor == 'black') {
    board.flip();
}

updateStatus();

var urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('code')) {
    socket.emit('joinGame', {
        code: urlParams.get('code'),
        time: parseInt(urlParams.get('time'), 10),
    });
}

socket.on('startGame', function(timeInterval) {
    gameHasStarted = true;
    initializeTimers(timeInterval);
    updateStatus();
});

socket.on('gameOverDisconnect', function() {
    gameOver = true;
    updateStatus();
});

socket.on('newMove', function(move) {
    game.move(move);
    board.position(game.fen());
    updateStatus();
});

socket.on('gameOverTimeout', function() {
    gameOver = true;
    updateStatus();
});
