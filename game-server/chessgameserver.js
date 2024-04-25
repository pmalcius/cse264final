/* Chess game server
Paulius Malcius and Evan Hu
Version 1: 4/25/2024
*/

// Constants
const ROWS_ON_BOARD = 8;
const COLS_ON_BOARD = 8;
const HOST = process.argv[2];
const PORT = process.argv[3];
let grid = null;

// Copied from: https://www.geeksforgeeks.org/how-to-create-a-guid-uuid-in-javascript/
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function createGrid() {
    grid = new Array(8);
    let r = 0, c = 0;
    for (r = 0; r < 8; ++r) {
        grid[r] = new Array(8);
        for (c = 0; c < 8; ++c)
        grid[r][c] = 0;
    }
    //return grid;
}

// Make it so it adds the pieces correctly.
function initGrid() {
    //let grid = createGrid();

    // White pieces
    grid[0][0] = 5;  // White rook
    grid[0][1] = 9;  // White knight
    grid[0][2] = 7;  // White bishop
    grid[0][3] = 3;  // White queen
    grid[0][4] = 1;  // White king
    grid[0][5] = 7;  // White bishop
    grid[0][6] = 9;  // White knight
    grid[0][7] = 5;  // White rook
    grid[1] = new Array(8).fill(11); // White pawns

    // Black pieces
    grid[7][0] = 6;   // Black rook
    grid[7][1] = 10;  // Black knight
    grid[7][2] = 8;  // Black bishop
    grid[7][3] = 4;   // Black queen
    grid[7][4] = 2;   // Black king
    grid[7][5] = 8;  // Black bishop
    grid[7][6] = 10;  // Black knight
    grid[7][7] = 6;   // Black rook
    grid[6] = new Array(8).fill(12); // Black pawns
    
    //return grid;
}

function log(fcn, ctx, e) {
    console.log(fcn + ': Error on input (' + ctx + ') ' + e.toString());
}

/****************
 * Player Class *
 ****************/

class Player {
    constructor(login) {
        this.name = login;
        // We could add their elo???
    }
}

// PlayerList Class

class PlayerList {

    constructor() {
        this.players = new Array();
        this.id2index = {};
        this.name2id = {};
    }
  
    add(player) {
        this.players.push(player);
        const id = uuidv4();
        this.id2index[id] = this.players.length - 1;
        this.name2id[player.name] = id;
        console.log(`PlayerList:add(${player.name} ${id} ${this.id2index[id]} ${this.name2id[player.name]})`)
    }
  
    length() {
        return this.players.length;
    }
  
    onList(id) {
        return id in this.id2index;
    }
  
    getId(name) {
        if (name in this.name2id) return this.name2id[name]
        else return "";
    }
  
    getName(id) {
        if (id in this.id2index) {
            const idx = this.id2index[id];
            return this.players[idx].name;
        } else {
            return "";
        }
    }
  
    dump() {
        for (i = 0; i < this.players.length; ++i) {
            const player = this.players[i];
            console.log(`${player.name} ${player.score}`)
        }
    }
  
}

const chessPlayers = new PlayerList();

function processLogin(socket, loginname) {
    console.log(`loginname: ${loginname}`);
    console.log(`type = ${typeof loginname}`)
    if ((loginname == null) || ((typeof loginname) !== "string") ) {
        socket.emit("debug", `ERROR: loginname is not a string`)
        return;
    } 
    let filteredName = loginname.replace(/[^a-zA-Z0-9 ]/g, "");
    if (filteredName.length <= 0) {
        console.log(`processLogin: Empty name rejected. Original text = ${loginname}`);
        socket.emit("debug", `ERROR: Filtered user name is empty. Original name is ${loginname}`)
    } else {
        let id = chessPlayers.getId(filteredName);
        while (id != "") {
            filteredName += "*";
            id = chessPlayers.getId(filteredName);
        }
        chessPlayers.add(new Player(filteredName));
        const newid = chessPlayers.getId(filteredName);
        console.log(`processLogin: name= ${loginname} filtered name= ${filteredName} new id=${newid}`);
        socket.emit("debug", `INFO: User ${filteredName} logged in with id ${newid}`)
        socket.emit("loginresponse", { id: newid, filteredusername: filteredName });
        updateStatus();
    }
}



/* Need to add chess logic here 
    1. Taking of a piece
    2. checks?
    3. moving
    4. IDK man
*/

function movePiece(grid, startX, startY, endX, endY) {
    // Check if the destination has an opponent's piece
    if (grid[endX][endY] !== 0) {
        console.log(`Piece taken at ${endX}, ${endY}`);
    }
    // Move the piece
    grid[endX][endY] = grid[startX][startY];
    grid[startX][startY] = 0;
    return grid;
}









