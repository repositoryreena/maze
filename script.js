const canvas = document.getElementById('maze-canvas');
const context = canvas.getContext('2d');

let cellSize = 40; // Size of each cell
let mazeSize = 8; // Initial maze size

let playerRow = 1; // Initial player row position
let playerCol = 0; // Initial player column position

// Define multiple moving obstacles
const obstacles = [
  { row: 3, col: 4 },
  { row: 6, col: 2 },
  { row: 4, col: 7 },
];

let hasWon = false;

// Function to generate a simple maze
function generateMaze(size) {
  const maze = [];

  // Initialize the maze with walls (1)
  for (let row = 0; row < size; row++) {
    maze[row] = [];
    for (let col = 0; col < size; col++) {
      maze[row][col] = 1;
    }
  }

  // Clear a path for the ball to move
  for (let row = 1; row < size - 1; row++) {
    for (let col = 1; col < size - 1; col++) {
      maze[row][col] = 0;
    }
  }

  // Set the entrance and exit
  maze[1][0] = 0; // Entrance
  maze[size - 2][size - 1] = 2; // Exit (green square)

  return maze;
}

// Generate the initial maze
let maze = generateMaze(mazeSize);

// Function to update obstacle positions (move randomly)
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
      maze[newRow][newCol] === 1
    );

    obstacle.row = newRow;
    obstacle.col = newCol;
  });
}

// Function to check for collision with an obstacle
function checkCollision() {
  obstacles.forEach((obstacle) => {
    if (playerRow === obstacle.row && playerCol === obstacle.col) {
      // Collision occurred, handle it here (e.g., restart the game)
      alert('You collided with an obstacle. Game over.');
      resetGame();
    }
  });
}

// Function to draw the maze
function drawMaze() {
  canvas.width = maze[0].length * cellSize;
  canvas.height = maze.length * cellSize;

  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[0].length; col++) {
      context.fillStyle = maze[row][col] === 1 ? 'black' : 'white';
      context.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);

      // Draw the win spot at the exit (green square)
      if (maze[row][col] === 2) {
        context.fillStyle = 'green';
        context.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }

  // Draw the player (red circle)
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

  // Draw the obstacles (blue squares)
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

// Function to handle player movement
function movePlayer(direction) {
  if (hasWon) {
    // If the player has won, move them inside the green square
    playerRow = mazeSize - 2;
    playerCol = mazeSize - 1;
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
        // You reached the green square (winning spot)
        alert('You won! You reached the green square.');
        hasWon = true;
        setTimeout(resetGame, 1000); // Automatically reset after 1 second
      }

      checkCollision();
    }
  }

  drawMaze();
}

// Reset the game
function resetGame() {
  playerRow = 1;
  playerCol = 0;
  hasWon = false;
  // Reset obstacle positions
  obstacles.forEach((obstacle) => {
    do {
      obstacle.row = Math.floor(Math.random() * (mazeSize - 2)) + 1;
      obstacle.col = Math.floor(Math.random() * (mazeSize - 2)) + 1;
    } while (maze[obstacle.row][obstacle.col] === 1);
  });
  maze = generateMaze(mazeSize);
  drawMaze();
}

// Event listener for arrow key presses
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

// Initialize the game
drawMaze();

// Game loop (update obstacle positions and check for collisions)
setInterval(function () {
  if (!hasWon) {
    updateObstacles();
    checkCollision();
  }
  drawMaze();
}, 1000); // Adjust the interval for obstacle movement
