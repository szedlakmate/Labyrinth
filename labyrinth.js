// **************** //
//  Labirinth Game  //
// **************** //


// Selectors for the board table, the free-tile-cell and the players' figures
// tables
var board = document.getElementById("board");
var freeBoard = document.getElementById("free");
// players
var green = document.querySelector("#green");
var yellow = document.querySelector("#yellow");
var red = document.querySelector("#red");
var blue = document.querySelector("#blue");
// texts
var insertText = document.querySelector("#insert");
var stepText = document.querySelector("#step");

// Mapping the tiles to the board
// Modifying the table should be handled here. Furthermore the table is set to be a constant.
var map = [[0, 16, 1, 17, 2, 18, 3], 
[19, 20, 21, 22, 23, 24, 25], 
[4, 26, 5, 27, 6, 28, 7], 
[29, 30, 31, 32, 33, 34, 35], 
[8, 36, 9, 37, 10, 38, 11], 
[39, 40, 41, 42, 43, 44, 45], 
[12, 46, 13, 47, 14, 48, 15],
[49]];

// Defining possible insertionpoints for the free tile 
const dragPoints = ["0-1","0-3","0-5","1-0","1-6","3-0","3-6","5-0","5-6","6-1","6-3","6-5"];

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
[0,1,0,1,null],[1,0,0,1,null],[1,0,1,0,null],[1,0,1,0,null]];

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

// Controlls keyread behavior *************************************** WRRRRRROOOOOOOOOOOONNNNNNNNNGGGGGGGGG
var canStep = false;

// Controlls insrertion behavior
var canInsert = false;

//******************************************************


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

function drawCellGrid(cell, color = "rgba(229, 229, 229, 0.75)"){
    cell.style.boxShadow = color + " 1px 0px 0px inset, " + color + " 0px 1px 0px inset, " + color + " -1px 0px 0px inset, " + color + " 0px -1px 0px inset";
}


function drawSide(cell, side, reset = false, color = "rgb(0, 0, 0)") {
    // cell: querySelector of the managable cell
    // side: [0, -1] aka [+left-right, +top-bottom]

    let borderWidth = 5; //px
    if (!cell.style.boxShadow || reset){
        cell.style.boxShadow = color + " " + side[0]*borderWidth + "px " + side[1]*borderWidth + "px " + "0px inset";
    } else {
        cell.style.boxShadow += ", "+ color + " " + side[0]*borderWidth + "px " + side[1]*borderWidth + "px " + "0px inset";
    }
};

function reDraw(){
    for (let row = 0; row<7; row++) {
        for (let col = 0; col < 7; col++) {
            // Set translations to zero
            board.rows[row].cells[col].style.transform = "";
            // Draw extra grid since the border-spacing is 0
            drawCellGrid(board.rows[row].cells[col]);
            // Draw walls as borders
            if (tiles[map[row][col]][0] === 1) drawSide(board.rows[row].cells[col], [ 0, 1]);
            if (tiles[map[row][col]][1] === 1) drawSide(board.rows[row].cells[col], [-1, 0]);
            if (tiles[map[row][col]][2] === 1) drawSide(board.rows[row].cells[col], [ 0,-1]);
            if (tiles[map[row][col]][3] === 1) drawSide(board.rows[row].cells[col], [ 1, 0]);
        }
    } 

    // Drawing walls on the free tile
    if (tiles[map[7][0]][0] === 1) drawSide(freeBoard.rows[0].cells[0], [ 0, 1], true);
    if (tiles[map[7][0]][1] === 1) drawSide(freeBoard.rows[0].cells[0], [-1, 0]);
    if (tiles[map[7][0]][2] === 1) drawSide(freeBoard.rows[0].cells[0], [ 0,-1]);
    if (tiles[map[7][0]][3] === 1) drawSide(freeBoard.rows[0].cells[0], [ 1, 0]);
}


function setAnimation(animate = true){
    for (let row = 0; row<7; row++) {
        for (let col = 0; col < 7; col++) {
            if (animate) {
                board.rows[row].cells[col].classList.add("animate");
            } else board.rows[row].cells[col].classList.remove("animate");
        }
    }
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
    // Visually rotate
    let rotation = 0;
    if (freeBoard.style.transform.match(/\d+/g)) {
       rotation = freeBoard.style.transform.match(/\d+/g).map(function(v) { return Number(v); });
   }
   rotation = Number(rotation) + 90;
   if (rotation+90 == Infinity) rotation = 0;

   freeBoard.style.transform = "rotate(" + rotation + "deg)";

    // Logically rotate
    let temp = tiles[map[7][0]][0];
    tiles[map[7][0]][0] = tiles[map[7][0]][3];
    tiles[map[7][0]][3] = tiles[map[7][0]][2];
    tiles[map[7][0]][2] = tiles[map[7][0]][1];
    tiles[map[7][0]][1] = temp;
}

// Controls the keypress events by calling the controllGame function in if needed
function checkKey(e) {
    if (true/*waitingForInput*/){
        e = e || window.event;
        if (keyMap[e.keyCode]) controllGame(keyMap[e.keyCode]);
    }
}

// Listener for insertion points
function setInsertionListener(dragPoints){
    for (let row = 0; row<7; row++) {
        for (let col = 0; col < 7; col++) {
            // Setting uplistener for inserting tile
            if (dragPoints.indexOf(row.toString()+"-"+col)>=0) {
                board.rows[row].cells[col].addEventListener("click", moveCheck);         
            }
        }
    } 
}

function moveCheck(e){
    if (canInsert){
        let rowIndex, colIndex;

        // If false, columns will be pushed
        let rowToBePushed = true;
        // True: positive, false:negative
        let direction;

        colIndex = e.currentTarget.cellIndex; 

        direction = !colIndex;

        if (e.currentTarget.classList.contains("row-0")) {
            rowIndex = 0; 
            rowToBePushed = false;
            direction = true;
        } else if (e.currentTarget.classList.contains("row-1")) {
            rowIndex = 1; 
        } else if (e.currentTarget.classList.contains("row-3")) {
            rowIndex = 3; 
        } else if (e.currentTarget.classList.contains("row-5")) {
            rowIndex = 5; 
        } else if (e.currentTarget.classList.contains("row-6")) {
            rowIndex = 6; 
            rowToBePushed = false;
        } 

        put(rowIndex, colIndex, rowToBePushed, direction);
    }
}

function put(row, col, rowToBePushed, direction){
    let step="-100%";
    let loopDir = 1; 
    var temp;

    if (direction) {
        step = "100%";
        loopDir = -1;
    }

    if (rowToBePushed){
        temp = [map[row][0],map[row][6]]; 

        for (let i = 3*(1-loopDir); Math.abs(i-3)<4; i += loopDir){
            // Visually move tiles
            board.rows[row].cells[i].style.transform = "translateX(" + step + ")";

            // Logically move tiles
            if (i=== 3*(1+loopDir)) {
                map[row][3*(1+loopDir)] = map [7][0];
                map[7][0] = temp[(1-loopDir)/2]; 
            } else map[row][i] = map[row][i + loopDir];
        }
    } else {
        temp = [map[0][col],map[6][col]]; 
        for (let i = 3*(1-loopDir); Math.abs(i-3)<4; i += loopDir){
            // Visually move tiles
            board.rows[i].cells[col].style.transform = "translateY(" + step + ")";

            // Logically move tiles
            if (i=== 3*(1+loopDir)) {
                map[3*(1+loopDir)][col] = map [7][0];
                map[7][0] = temp[(1-loopDir)/2]; 
            } else map[i][col] = map[i + loopDir][col];
        }
    }


    setTimeout(noAnimationRedraw, 300);

    // Proceeding to the next issue in game flow
    changeGameFlow("step");
}

function noAnimationRedraw(){
    setAnimation(false);
    reDraw();
    setTimeout(setAnimation, 300);
}

function startGame(player){
    // Starting gameplay   
    canInsert = true;
    canStep = false;
    insertText.classList.add("selected");
}

function changeGameFlow(command){
    switch (command){
        case "insert":
        playerTurn++;
        canStep = false;
        canInsert = true;
        insertText.classList.add("selected");
        stepText.classList.remove("selected");
        break;

        case "step":
        canStep = true;
        canInsert = false;
        insertText.classList.remove("selected");
        stepText.classList.add("selected");
        break;

        default:
        console.log("Command not found");
        break;
    }

}


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
        if (canStep) checkStep(player, playerTurn%playerNum, 0, -1);
        break;

        case "down":
        if (canStep) checkStep(player, playerTurn%playerNum, 0, 1);
        break;

        case "left":
        if (canStep) checkStep(player, playerTurn%playerNum, -1, 0);
        break;

        case "right":
        if (canStep) checkStep(player, playerTurn%playerNum, 1, 0);
        break;

        case "enter":
        if (canStep) changeGameFlow("insert");
        break;

        case "r":
        if (canInsert) rotate();
        break;
    }

    return player;

}

// *********************************** MAIN *********************************
reDraw();

setAnimation(true);

setPlayers(playerNum);

document.onkeydown = checkKey;

setInsertionListener(dragPoints);

startGame();

// STANDING ON THE SAME SPOT BUG HANDLING! 

console.log("Delete 'Menu'");