// **************** //
//  Labirinth Game  //
// **************** //


// Selectors for the board table, the free-tile-cell and the players' figures
// tables
var board = document.getElementById("board");
var freeBoard = document.getElementById("free");
// players
var players = [document.querySelector("#green"), document.querySelector("#yellow"), 
document.querySelector("#red"), document.querySelector("#blue")];
// texts
var insertText = document.querySelector("#insert");
var stepText = document.querySelector("#step");
var playerSign = document.querySelector("#playerColor");

var playerColors = ["green", "yellow", "red", "blue"];

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

// Defining possible insertionpoints for the free tile --- "row-col"
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
var tiles = fixedTiles.concat(shuffleArray(rotateRandom(movingTiles)));

// Game controller variable
var endGame = false;

// Number of players
var playerNum = 4;

// Counts how many player had a turn in total. Incase of 4 players,
// a whole loop means 4 turns.
var playerTurn = 0;

// Coordinates of the players on the 7x7 board
var playerCoords = [[0, 0], [6, 0], [6, 6], [0, 6]];

// Game logic variables
var canStep = false;
var canInsert = false;

// Mapping for key events
var keyMap = {37:"left", 38:"up", 39:"right", 40:"down", 13:"enter", 82:"r", 27:"esc"};


// Setting up players
function setPlayers(playerNum){
    drawPlayer(0);
    if (playerNum<2) return;
    drawPlayer(1);

    if (playerNum<3) return;
    drawPlayer(2);

    if (playerNum<4) return;
    drawPlayer(3);
}

// Moving HTML elements
function drawPlayer(actualPlayer){
    let baseScaleX = 100, baseScaleY= 100; 

    players[actualPlayer].style.transform = "translate(" + (/*shift[0]+*/ playerCoords[actualPlayer][0]*baseScaleX) + "%, " + (/*shift[1] +*/ playerCoords[actualPlayer][1]*baseScaleY) + "%)";
    return players[actualPlayer].style.transform;
}

// Check whether a step is legal or not. 
// If thestep is possible, makes is happen and returns true, if not, it returns false.
function checkStep(actualPlayer, dx, dy, maxCoord = 6){
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
        drawPlayer(actualPlayer);
        return true;
    }
}
return false;
}

function drawCellGrid(cell, color = "rgba(229, 229, 229, 0.75)"){
    cell.style.boxShadow = color + " 1px 0px 0px inset, " + color + " 0px 1px 0px inset, " + color + " -1px 0px 0px inset, " + color + " 0px -1px 0px inset";
}


function drawSide(cell, side, color = "rgb(0, 0, 0)") {
    // side: [0, -1] => [+left-right, +top-bottom] 

    let borderWidth = 5; //px

    if (!cell.style.boxShadow){
        cell.style.boxShadow = color + " " + side[0]*borderWidth + "px " + side[1]*borderWidth + "px " + "0px inset";
    } else {
        cell.style.boxShadow += ", "+ color + " " + side[0]*borderWidth + "px " + side[1]*borderWidth + "px " + "0px inset";
    }
};

function reDraw() {
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
            // Set translations to zero
            board.rows[row].cells[col].style.transform = "";
            board.rows[row].cells[col].style.boxShadow = "";
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
    freeBoard.rows[0].cells[0].style.transform = "";
    freeBoard.rows[0].cells[0].style.boxShadow = "";

    if (tiles[map[7][0]][0] === 1) drawSide(freeBoard.rows[0].cells[0], [ 0, 1]);
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
    if (animate) {
        freeBoard.rows[0].cells[0].classList.add("animate");
    } else freeBoard.rows[0].cells[0].classList.remove("animate");
}


function shuffleArray(array) {
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
    // Should randomly rotate the tiles !!! NEED TO BE FIXED
    console.log("Randomized batch rotation is not implemented yet");
    return array
}

// Rotating free tile clockwise
function rotateFreeTile(){
    // Visually rotate
    let rotation = 0;
    if (freeBoard.rows[0].cells[0].style.transform.match(/\d+/g)) {
       rotation = freeBoard.rows[0].cells[0].style.transform.match(/\d+/g).map(function(v) { return Number(v); });
   }
   rotation = Number(rotation) + 90;
   if (rotation+90 == Infinity) rotation = 0;

   freeBoard.rows[0].cells[0].style.transform = "rotate(" + rotation + "deg)";

    // Logically rotate
    let temp = tiles[map[7][0]][0];
    tiles[map[7][0]][0] = tiles[map[7][0]][3];
    tiles[map[7][0]][3] = tiles[map[7][0]][2];
    tiles[map[7][0]][2] = tiles[map[7][0]][1];
    tiles[map[7][0]][1] = temp;
}

// Controls the keypress events by calling the controllGame function in if needed
function checkKey(e) {
    e = e || window.event;
    if (keyMap[e.keyCode]) controllGame(keyMap[e.keyCode]);
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

    for (let i=0; i<4; i++){
        if (rowToBePushed){
            if (row === playerCoords[i][1]){
                playerCoords[i][0] -= loopDir;
                playerCoords[i][0] = (playerCoords[i][0]+7) % 7;
                drawPlayer(i);
            }

        } else {
            if (col === playerCoords[i][0]){
                playerCoords[i][1] -= loopDir;
                playerCoords[i][1] = (playerCoords[i][1]+7) % 7;
                drawPlayer(i);
            }
        }

    }

    setTimeout(noAnimationRedraw, 300);

    // Proceeding to the next issue in game flow
    changeGameFlow("step");
}

function noAnimationRedraw(time = 300){
    setAnimation(false);
    reDraw();
    setTimeout(setAnimation, time);
}

function startGame(player){
    // Starting gameplay   
    canInsert = true;
    canStep = false;
    insertText.classList.add("selected");
}

function changeGameFlow(command){
    switch (command){
        // Finishing player's turn by stepping and setting the enviroment for next player's insertion
        case "insert":
        playerTurn++;
        playerSign.style.backgroundColor = playerColors[playerTurn%playerNum];
        canStep = false;
        canInsert = true;
        insertText.classList.add("selected");
        stepText.classList.remove("selected");
        break;

        // After insertion setting up game for stepping
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
    switch (keyPressed){
        case "up":
        if (canStep) checkStep(playerTurn%playerNum, 0, -1);
        break;

        case "down":
        if (canStep) checkStep(playerTurn%playerNum, 0, 1);
        break;

        case "left":
        if (canStep) checkStep(playerTurn%playerNum, -1, 0);
        break;

        case "right":
        if (canStep) checkStep(playerTurn%playerNum, 1, 0);
        break;

        case "enter":
        if (canStep) changeGameFlow("insert");
        break;

        case "r":
        if (canInsert) rotateFreeTile();
        break;
    }
    //return player;
}

function initalizeGame(){
    // Drawing
    reDraw();
    setAnimation(true);
    setPlayers(playerNum);

    // Setting listeners
    document.onkeydown = checkKey;
    setInsertionListener(dragPoints);

    // Initalizing game logic
    startGame();

    /* Notes

        STANDING ON THE SAME SPOT BUG HANDLING! 
    */
}


// *********************************** MAIN *********************************
initalizeGame();