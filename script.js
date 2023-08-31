const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");

const cellSize = 32; // Size of each cell in pixels
const scale = window.devicePixelRatio; // Get device pixel ratio

const numRows = 20;
const numCols = 40;

canvas.style.width = numCols * cellSize + "px";
canvas.style.height = numRows * cellSize + "px";

canvas.width = numCols * cellSize * scale;
canvas.height = numRows * cellSize * scale;

context.scale(scale, scale);

const cellColors = new Array(numRows)
  .fill(null)
  .map(() => new Array(numCols).fill("white"));

let hoverRow = -1;
let hoverCol = -1;

function drawCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const x = col * cellSize;
      const y = row * cellSize;

      let cellColor = cellColors[row][col];
      if (row === hoverRow && col === hoverCol) {
        cellColor = "grey";
      }

      context.fillStyle = cellColor;
      context.fillRect(x, y, cellSize, cellSize);

      context.strokeStyle = "black";
      context.strokeRect(x, y, cellSize, cellSize);
    }
  }
}

function toggleCell(row, col) {
  if (row >= 0 && row < numRows && col >= 0 && col < numCols) {
    cellColors[row][col] = cellColors[row][col] === "white" ? "black" : "white";
    drawCanvas();
  }
}

canvas.addEventListener("mousedown", function (event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const clickedCol = Math.floor(mouseX / cellSize);
  const clickedRow = Math.floor(mouseY / cellSize);

  toggleCell(clickedRow, clickedCol);
});

canvas.addEventListener("mousemove", function (event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  hoverCol = Math.floor(mouseX / cellSize);
  hoverRow = Math.floor(mouseY / cellSize);

  drawCanvas();
});

canvas.addEventListener("mouseout", function () {
  hoverRow = -1;
  hoverCol = -1;

  drawCanvas();
});

drawCanvas(); // Initial draw
