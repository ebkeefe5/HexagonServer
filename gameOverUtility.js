/*
** this is a utility class for checking if the game is over 
** this should be improved to be either a DFS or BFS
** BFS is preferable
*/


module.exports = {player1WinningPath, player2WinningPath};

const{ BOARD_DIMENSION } = require('./constants');

function player1WinningPath(board)
{
	var winningRedBoard = JSON.parse(JSON.stringify(board)); 

	var foundNewHexagon = false;
	for (var i = 0; i < BOARD_DIMENSION; i++)
	{
		if (winningRedBoard[0][i] == 1)
		{
			winningRedBoard[0][i] = 3;
			foundNewHexagon = true;
		}
	}
	if (!foundNewHexagon)
		return null;

    var row = 1;
	while(true)
	{
		foundNewHexagon = false;
		for (var i= 0; i < BOARD_DIMENSION; i++)
		{
			if (winningRedBoard[row][i] == 1 && isReachable(row, i, winningRedBoard, 3))
			{
				winningRedBoard[row][i] = 3;
				foundNewHexagon = true;
				break;
			}
		}
		if (foundNewHexagon && row == BOARD_DIMENSION - 1)
			return winningRedBoard;
		else if (foundNewHexagon)
			row++;
		else if (!foundNewHexagon && row == 1)
			return null;
		else
			row--;
	}
}

function player2WinningPath(roomName)
{
	var winningGreenBoard = JSON.parse(JSON.stringify(board)); 

	var foundNewHexagon = false;
	for (var i = 0; i < BOARD_DIMENSION; i++)
	{
		if (winningGreenBoard[i][0] == 2)
		{
			winningGreenBoard[i][0] = 4;
			foundNewHexagon = true;
		}
	}
	if (!foundNewHexagon)
		return null;

    var col = 1;
	while(true)
	{
		foundNewHexagon = false;
		for (var i= 0; i < BOARD_DIMENSION; i++)
		{
			if (winningGreenBoard[i][col] == 2 && isReachable(i, col, winningGreenBoard, 4))
			{
				winningGreenBoard[i][col] = 4;
				foundNewHexagon = true;
				break;
			}
		}
		if (foundNewHexagon && col == BOARD_DIMENSION - 1)
			return winningGreenBoard;
		else if (foundNewHexagon)
			col++;
		else if (!foundNewHexagon && col == 1)
			return null;
		else
			col--;
	}
}

/*
* is this hexagon adjacent to at least one other hexagon
* that we have already identified to be reachable
*/
function isReachable(row, col, winningRedBoard, reachableCode)
{
	//check above and to the left
	if (row - 1 >= 0 && winningRedBoard[row - 1][col] == reachableCode)
		return true;

	//check above and to the right
	if (row - 1 >= 0 && col + 1 < BOARD_DIMENSION && winningRedBoard[row - 1][col + 1] == reachableCode)
		return true;

	//check directly left
	if (col - 1 >= 0 && winningRedBoard[row][col - 1] == reachableCode)
		return true;

	//check directly right
	if (col + 1 < BOARD_DIMENSION && winningRedBoard[row][col + 1] == reachableCode)
		return true;

	//check below and to the left
	if (row + 1 < BOARD_DIMENSION && col -1 >= 0 && winningRedBoard[row + 1][col -1] == reachableCode)
		return true;

	//check below and to the right
	if (row + 1 < BOARD_DIMENSION && winningRedBoard[row + 1][col] == reachableCode)
		return true;

	return false;
}