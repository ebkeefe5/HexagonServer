/**
 ** this is the server for the hexagon game
 ** this is going to be hosted through GCP at http://35.225.166.66/
 **
**/

const https = require('https');
const fs = require('fs');
var express = require('express');
var app = module.exports = express();

const initBoard = require("./game");
const{ BOARD_DIMENSION } = require('./constants');
const { player1WinningPath, player2WinningPath } = require("./gameOverUtility");
const { makeid } = require("./randId");

const server = https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('certificate.crt'),
  ca: fs.readFileSync('intermediate.crt'),
  requestCert: true,
  rejectUnauthorized: false
},app);

server.listen(8080);

const io = require('socket.io')(server, {
  cors: {
    origin:'https://ebkeefe5.github.io',
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

const board = {};
const turn = {};
const gameOver = {};
const firstTurn ={};

const clientRooms = {};

io.on('connection', client => {

  client.on('newGame', handleNewGame);
  client.on('hexagonClicked', handleHexagonClicked);
  client.on('joinGame', handleJoinGame);

  function handleJoinGame(roomName) {
      const users = io.sockets.adapter.rooms.get(roomName);

      if (users === undefined || users.size == 0){
        client.emit('unknownCode');
        return;
      }
      else if (users.size > 1)
      {
       client.emit('tooManyPlayers');
       return;
      }

      clientRooms[client.id] = roomName;

      client.join(roomName);
      client.number = 2;
      client.emit('init', 2);
      client.emit('gameCode', roomName);

      client.emit('update', {data:{gameBoard:board[roomName],turn: turn[roomName]}});
  }

  function handleNewGame() {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    board[roomName] = initBoard();
    turn[roomName] = 1;
    gameOver[roomName] = false;
    firstTurn[roomName] = 1;

    client.join(roomName);

    client.number = 1;
    client.emit('init', 1);

    client.emit('update', {data:{gameBoard:board[roomName],turn: turn[roomName]}});
  }

  function handleHexagonClicked(hexagon)
  {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }

    if (board[roomName] === undefined)
    {
      client.emit("disconnected")
      return;
    }


    if (gameOver[roomName] || board[roomName][hexagon.row][hexagon.col] != 0 || client.number != turn[roomName])
      return;

    updateFirstTurnModel(roomName);
    updateBoardModel(hexagon.row, hexagon.col, roomName);
    if (turn[roomName] == 1)
    {
      var winningRedBoard = player1WinningPath(board[roomName]);
      if (winningRedBoard != null)
      {
        turn[roomName] = 3;
        board[roomName] = winningRedBoard;
        gameOver[roomName] = true;
      }
    }
    else
    {
      var winningGreenBoard = player2WinningPath(board[roomName]);
      if (winningGreenBoard != null)
      {
        turn[roomName] = 4;
        board[roomName] = winningGreenBoard;
        gameOver[roomName] = true;
      }
    }
    updateTurnModel(roomName);
    io.sockets.in(roomName).emit('update', {data:{gameBoard:board[roomName],turn:turn[roomName]}});
  }

  /*
  * the behaviour here is that if a client disconnects, we kill the room
  * another client in the room will have to reload the page
  * this may not be desired but is the simplest solution at this time
  */
  client.on('disconnect', function () {
    if (clientRooms[client.id] === undefined)
      return;

    const room = clientRooms[client.id];
    delete clientRooms[client.id];

    if (board[room] === undefined)
        return;
    delete board[room];

    if (gameOver[room] === undefined)
      return;
    delete gameOver[room];

    if (turn[room] === undefined)
        return;
    delete turn[room];

    if (firstTurn[room] === undefined)
      return;
    delete firstTurn[room];
  });
});

//no need to change the color, but after the first turn, any player may claim the center hexagon
function updateFirstTurnModel(roomName)
{
  if (firstTurn[roomName])
  {
      firstTurn[roomName] = false; //be sure to only do this once
      board[roomName][(BOARD_DIMENSION - 1)/2][(BOARD_DIMENSION - 1)/2] = 0;
  }
}

function updateTurnModel(roomName)
{
  if (turn[roomName] == 1)
          turn[roomName] = 2;
  else if (turn[roomName] == 2)
          turn[roomName] = 1;
}

function updateBoardModel(row, col, roomName)
{
  board[roomName][row][col] = turn[roomName];
}

//server.listen(process.env.PORT || 3000);
