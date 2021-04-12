/**
** represents the state of the game in terms of the board and whose turn it is
**/

module.exports = initBoard;
const{ BOARD_DIMENSION } = require('./constants');

function initBoard() {
  boardDimension = 9;
  const board = createBoard()
  return board;
}

function createBoard() {
  console.log(BOARD_DIMENSION);
  board = []
  for (var i = 0 ; i < BOARD_DIMENSION; i++)
  {
    row = new Array(BOARD_DIMENSION).fill(0);
    board.push(row);
  }
   
  board[(BOARD_DIMENSION-1)/2][(BOARD_DIMENSION-1)/2]=-1;

  return board;
}