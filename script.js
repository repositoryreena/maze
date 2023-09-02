const canvas = document.getElementById('maze-canvas');
const context = canvas.getContext('2d');

let cellSize = 40;
let mazeSize = 8;
let numObstacles = 0;

let playerRow = 1;
let playerCol = 0;

const obstacles = [];

let hasWon = false;

function generateMaze(size, numObstacles) {
  const maze = [];

  for (let row = 0; row < size; row++) {
    maze[row] = [];
    for (let col = 0; col < size; col++) {
      maze[row][col] = 1;
    }
  }

  for (let row = 1; row < size - 1; row++) {
    for (let col = 1; col < size - 1; col++) {
      maze[row][col] = 0;
    }
  }

  maze[1][0] = 0;
  maze[size - 2][size - 1] = 2;

  // Avoid top-left and bottom-right corners for obstacles
  const cornerExclusions = [
    [1, 1],                      // Top-left corner
    [size - 2, size - 2],        // Bottom-right corner
  ];

  for (let i = 0; i < numObstacles; i++) {
    let obstacleRow, obstacleCol;
    do {
      obstacleRow = Math.floor(Math.random() * (size - 2)) + 1;
      obstacleCol = Math.floor(Math.random() * (size - 2)) + 1;
    } while (
      maze[obstacleRow][obstacleCol] === 1 ||
      (obstacleRow === 1 && obstacleCol === 0) ||
      cornerExclusions.some(([row, col]) => obstacleRow === row && obstacleCol === col)
    );
    maze[obstacleRow][obstacleCol] = 1;
    obstacles.push({ row: obstacleRow, col: obstacleCol }); // Add obstacle to the list
  }

  return maze;
}


let maze = generateMaze(mazeSize, numObstacles);

function updateObstacles() {
  obstacles.forEach((obstacle) => {
    let newRow, newCol;
    do {
      const rowMovement = Math.floor(Math.random() * 3) - 1;
      const colMovement = Math.floor(Math.random() * 3) - 1;
      newRow = obstacle.row + rowMovement;
      newCol = obstacle.col + colMovement;
    } while (
      newRow < 0 ||
      newRow >= mazeSize ||
      newCol < 0 ||
      newCol >= mazeSize ||
      maze[newRow][newCol] === 1 ||
      (newRow === 1 && newCol === 0) // Prevent obstacles from moving towards the entrance
    );

    obstacle.row = newRow;
    obstacle.col = newCol;
  });
}


function checkCollision() {
  obstacles.forEach((obstacle) => {
    if (playerRow === obstacle.row && playerCol === obstacle.col) {
      alert('You collided with an obstacle. Restarting from round one.');
      numObstacles = 0; // Reset the number of obstacles to zero
      resetGame();
    }
  });
}

function drawMaze() {
  canvas.width = maze[0].length * cellSize;
  canvas.height = maze.length * cellSize;

  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[0].length; col++) {
      context.fillStyle = maze[row][col] === 1 ? 'black' : 'white';
      context.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);

      if (maze[row][col] === 2) {
        context.fillStyle = 'green';
        context.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }

  context.beginPath();
  context.arc(
    playerCol * cellSize + cellSize / 2,
    playerRow * cellSize + cellSize / 2,
    cellSize / 2 - 5,
    0,
    2 * Math.PI
  );
  context.fillStyle = 'red';
  context.fill();
  context.closePath();

  obstacles.forEach((obstacle) => {
    context.fillStyle = 'blue';
    context.fillRect(
      obstacle.col * cellSize,
      obstacle.row * cellSize,
      cellSize,
      cellSize
    );
  });
}

function movePlayer(direction) {
  if (hasWon) {
    playerRow = mazeSize - 2;
    playerCol = mazeSize - 1;
    numObstacles++; // Add an additional obstacle when you win
  } else {
    const newRow =
      playerRow + (direction === 'down' ? 1 : direction === 'up' ? -1 : 0);
    const newCol =
      playerCol + (direction === 'right' ? 1 : direction === 'left' ? -1 : 0);

    if (
      newRow >= 0 &&
      newRow < mazeSize &&
      newCol >= 0 &&
      newCol < mazeSize &&
      maze[newRow][newCol] !== 1
    ) {
      playerRow = newRow;
      playerCol = newCol;

      if (maze[newRow][newCol] === 2) {
        alert('You won! You reached the green square.');
        hasWon = true;
        numObstacles++; // Add an additional obstacle when you win
        setTimeout(resetGame, 1000);
      }

      checkCollision();
    }
  }

  drawMaze();
}

function resetGame() {
  playerRow = 1;
  playerCol = 0;
  hasWon = false;
  obstacles.length = 0; // Clear the list of obstacles

  maze = generateMaze(mazeSize, numObstacles);
  drawMaze();
}

document.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowUp') {
    movePlayer('up');
  } else if (event.key === 'ArrowDown') {
    movePlayer('down');
  } else if (event.key === 'ArrowLeft') {
    movePlayer('left');
  } else if (event.key === 'ArrowRight') {
    movePlayer('right');
  }
});

drawMaze();

setInterval(function () {
  if (!hasWon) {
    updateObstacles();
    checkCollision();
  }
  drawMaze();
}, 1000);
