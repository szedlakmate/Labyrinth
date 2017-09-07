// **************** //
//  Labirinth Game  //
// **************** //


// Selectors for the board table, the free-tile-cell and the players' figures
var board = document.getElementById("board");
var freeBoard = document.getElementById("free");
var green = document.querySelector("#green");
var yellow = document.querySelector("#yellow");
var red = document.querySelector("#red");
var blue = document.querySelector("#blue");

// Mapping the tiles to the board
// Modifying the table should be handled here. Furthermore the table is set to be a constant.
var map = [[0, 16, 1, 17, 2, 18, 3], 
[19, 20, 21, 22, 23, 24, 25], 
[4, 26, 5, 27, 6, 28, 7], 
[29, 30, 31, 32, 33, 34, 35], 
[8, 36, 9, 37, 10, 38, 11], 
[39, 40, 41, 42, 43, 44, 45], 
[12, 46, 13, 47, 14, 48, 15]];

// Fixed tiles of the original game
const fixedTiles = [[1,0,0,1,null], [1,0,0,0,null], [1,0,0,0,null], [1,1,0,0,null],
[0,0,0,1,null], [0,0,0,1,null], [1,0,0,0,null], [0,1,0,0,null],
[0,0,0,1,null], [0,0,1,0,null], [0,1,0,0,null], [0,1,0,0,null],
[0,0,1,1,null], [0,0,1,0,null], [0,0,1,0,null], [0,1,1,0,null]];


// Moving tiles of the original game
// ********************** FAKE DATA *****************************
const movingTiles = [[1,0,1,0,null],[0,1,0,1,null],[1,0,0,0,null],[1,0,0,1,null],[1,0,0,1,null],
[1,0,0,1,null],[1,0,0,1,null],[1,0,0,1,null],[1,0,0,1,null],[1,0,0,1,null],
[1,0,0,1,null],[1,0,0,1,null],[1,0,0,1,null],[0,0,0,1,null],[1,0,0,1,null],
[1,0,1,0,null],[1,0,0,1,null],[0,1,0,1,null],[1,0,0,1,null],[1,0,0,1,null],
[1,0,0,1,null],[0,1,0,1,null],[1,0,0,1,null],[1,0,1,0,null],[0,1,0,1,null],
[1,0,0,1,null],[1,0,0,1,null],[1,0,0,1,null],[1,0,0,1,null],[1,0,0,1,null],
[0,1,0,1,null],[1,0,0,1,null],[1,0,1,0,null]];

// Combined tiles for mapping
const tiles = fixedTiles.concat(shuffle(rotateRandom(movingTiles)));

// Game controller variable
var endGame = false;

// Number of players
var playerNum = 4;

// Counts how many player had a turn in total. Incase of 4 players,
// a whole loop means 4 turns.
var playerTurn = 0;

// Coordinates of the players on the 7x7 board
var playerCoords = [[0,0],[6,0],[6,6],[0,6]];

// Controlls keyread behavior
var waitingForInput = false;

// Mapping for key events
var keyMap = {37:"left", 38:"up", 39:"right", 40:"down", 13:"enter", 82:"r", 27:"esc"};


// Setting players startes position
function setPlayers(players){
    let starterPosX = 3, starterPosY = 3;

    stepDirection(green, playerCoords[0][0]-starterPosX, playerCoords[0][1]-starterPosY);
    if (players<2) return;

    stepDirection(yellow, playerCoords[1][0]-starterPosX, playerCoords[1][1]-starterPosY);
    if (players<3) return;

    stepDirection(red, playerCoords[2][0]-starterPosX, playerCoords[2][1]-starterPosY);
    if (players<4) return;

    stepDirection(blue, playerCoords[3][0]-starterPosX, playerCoords[3][1]-starterPosY);
}

// Moving HTML elements
function stepDirection(element, dx, dy){
    let baseScaleX = 100, baseScaleY= 100; 
    // Current translation values
    let shift = [0,0];
    if (element.style.transform.match(/[+-]?\d+(\.\d+)?/g)) {
       shift = element.style.transform.match(/[+-]?\d+(\.\d+)?/g).map(function(v) { return parseFloat(v); });
   }

   element.style.transform = "translate(" + (shift[0]+ dx*baseScaleX) + "%, " + (shift[1] + dy*baseScaleY) + "%)";
   return element.style.transform;
}

// Check whether a step is legal or not. 
// If thestep is possible, makes is happen and returns true, if not, it returns false.
function checkStep(playerHTML, actualPlayer, dx, dy, maxCoord = 6){
    let direction;
    switch (dx+dy*3){
        case -1:
        direction = 3;
        break;

        case 1:
        direction = 1;
        break;

        case 3:
        direction = 2;
        break;

        case -3:
        direction = 0;
        break;
    }
    
    // Conditions:
    // Are we still on the board?
    if  ((playerCoords[actualPlayer][0] + dx <= maxCoord) && (playerCoords[actualPlayer][0] + dx >= 0) && 
        (playerCoords[actualPlayer][1] + dy <= maxCoord) && (playerCoords[actualPlayer][1] + dy >= 0)){  
        // Is it possible to leave the tile?
        // Is itt possible to arrive to the desired tile X/Y-dir?      
        if ((tiles[map[playerCoords[actualPlayer][1]][playerCoords[actualPlayer][0]]][direction]===0) &&
            (!dx ||(tiles[map[playerCoords[actualPlayer][1]][playerCoords[actualPlayer][0]+ dx]][(direction+2)%4]===0)) &&
            (!dy ||(tiles[map[playerCoords[actualPlayer][1]+ dy][playerCoords[actualPlayer][0]]][(direction+2)%4]===0))) {

            playerCoords[actualPlayer][0] += dx;
        playerCoords[actualPlayer][1] += dy;
        stepDirection(playerHTML, dx, dy);
        return true;
    }
}
return false;
}

function drawCellGrid(cell, color = "rgba(239, 239, 239, 0.4)"){
    cell.style.boxShadow = color + " 1px 0px 0px inset, " + color + " 0px 1px 0px inset, " + color + " -1px 0px 0px inset, " + color + " 0px -1px 0px inset";
}


function drawSide(cell, side, color = "rgb(0, 0, 0)") {
    // cell: querySelector of the managable cell
    // side: [0, -1] aka [+left-right, +top-bottom]

    let borderWidth = 5; //px
    if (!cell.style.boxShadow){
        cell.style.boxShadow = color + " " + side[0]*borderWidth + "px " + side[1]*borderWidth + "px " + "0px inset";
    } else {
        cell.style.boxShadow += ", "+ color + " " + side[0]*borderWidth + "px " + side[1]*borderWidth + "px " + "0px inset";
    }
};

function reDraw(){
    for (let row = 0; row<7; row++) {
        for (let col = 0; col < 7; col++) {
            // Draw extra grid since the border-spacing is 0
            drawCellGrid(board.rows[row].cells[col]);
            // Draw walls as borders
            if (tiles[map[row][col]][0] === 1) drawSide(board.rows[row].cells[col], [ 0, 1]);
            if (tiles[map[row][col]][1] === 1) drawSide(board.rows[row].cells[col], [-1, 0]);
            if (tiles[map[row][col]][2] === 1) drawSide(board.rows[row].cells[col], [ 0,-1]);
            if (tiles[map[row][col]][3] === 1) drawSide(board.rows[row].cells[col], [ 1, 0]);
        }
    } 

    if (tiles[tiles.length-1][0] === 1) drawSide(freeBoard.rows[0].cells[0], [ 0, 1]);
    if (tiles[tiles.length-1][1] === 1) drawSide(freeBoard.rows[0].cells[0], [-1, 0]);
    if (tiles[tiles.length-1][2] === 1) drawSide(freeBoard.rows[0].cells[0], [ 0,-1]);
    if (tiles[tiles.length-1][3] === 1) drawSide(freeBoard.rows[0].cells[0], [ 1, 0]);
}


function shuffle(array) {
    // Knuth shuffle from https://github.com/Daplie/knuth-shuffle
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function rotateRandom(array){
    // Should randomly rotate the tiles XXX NEED TO BE FIXED
    return array
}

// Rotating free tile clockwise
function rotate(){
    // Visually rotating
    let rotation = 0;
    if (freeBoard.style.transform.match(/\d+/g)) {
       rotation = freeBoard.style.transform.match(/\d+/g).map(function(v) { return Number(v); });
    }
    rotation = Number(rotation) + 90;
    if (rotation+90 == Infinity) rotation = 0;

    freeBoard.style.transform = "rotate(" + rotation + "deg)";
    
    // Logically rotating
}

// Controls the keypress events by calling the controllGame function in if needed
function checkKey(e) {
    if (waitingForInput){
        e = e || window.event;
        if (keyMap[e.keyCode]) controllGame(keyMap[e.keyCode]);
    }
}

function put(){

}

function step(player){
    waitingForInput = true;
}

function turn(player){
    put();
    
    waitingForInput = true;
}

// *********************************** MAIN *********************************
reDraw();

setPlayers(playerNum);

document.onkeydown = checkKey;

// STANDING ON THE SAME SPOT BUG HANDLING! 

// *********************************** LOOP ******************************
function controllGame(keyPressed){
    let player;
    switch (playerTurn%playerNum){
        case 0:
        player = green;
        break;

        case 1:
        player = yellow;
        break;

        case 2:
        player = red;
        break;

        case 3:
        player = blue;
        break;
    }

    switch (keyPressed){
        case "up":
        checkStep(player, playerTurn%playerNum, 0, -1);
        break;

        case "down":
        checkStep(player, playerTurn%playerNum, 0, 1);
        break;

        case "left":
        checkStep(player, playerTurn%playerNum, -1, 0);
        break;

        case "right":
        checkStep(player, playerTurn%playerNum, 1, 0);
        break;

        case "enter":
        waitingForInput = false;
        playerTurn++;
        turn();
        break;

        case "r":
        rotate();
        break;
    }

    return player;

}

turn();