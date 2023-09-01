// redesign UI
// Maybe add a brush size
// Maybe add zoom levels
// Maybe add premade structures
// Maybe add seed support
$(document).ready(function () {
  const canvas = document.getElementById("myCanvas");
  const context = canvas.getContext("2d");

  const cellSize = 16;
  const scale = window.devicePixelRatio;

  const numRows = 40;
  const numCols = 80;

  const cells = Array.from(Array(numRows), _ => Array(numCols).fill(0));

  canvas.style.width = numCols * cellSize + "px";
  canvas.style.height = numRows * cellSize + "px";

  canvas.width = numCols * cellSize * scale;
  canvas.height = numRows * cellSize * scale;

  context.scale(scale, scale);

  let hoverRow = -1;
  let hoverCol = -1;
  const maxSpeed = 1000;

  let isDragging = false;
  let prevDragRow = -1;
  let prevDragCol = -1;

  let running = false;
  let interval;


  function drawCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const x = col * cellSize;
        const y = row * cellSize;

        let cellColor = "white";

        if (cells[row][col] == 1) {
          cellColor = "black";
        } else if (row === hoverRow && col === hoverCol) {
          cellColor = "grey";
        }

        context.fillStyle = cellColor;
        context.fillRect(x, y, cellSize, cellSize);

        context.strokeStyle = "black";
        context.strokeRect(x, y, cellSize, cellSize);
      }
    }
  }

  function toggleCell(row, col, forcedLive) {
    if (row >= 0 && row < numRows && col >= 0 && col < numCols) {
      if (forcedLive) {
        cells[row][col] = 1;
      } else {
        cells[row][col] = cells[row][col] === 0 ? 1 : 0;
      }
      drawCanvas();
    }
  }
  
  function countLiveNeighbours(row, col) {
    let liveNeighbors = 0;

    // Define the relative positions of neighbors (including diagonals)
    const neighborsOffsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

    for (const offset of neighborsOffsets) {
      const newRow = row + offset[0];
      const newCol = col + offset[1];

      // Check if the new position is within bounds
      if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
        liveNeighbors += cells[newRow][newCol];
      }
    }

    return liveNeighbors;
  }

  function nextIteration() {
    const newCells = Array.from(Array(numRows), _ => Array(numCols).fill(0));

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const neighbors = countLiveNeighbours(row, col);
        if (cells[row][col] === 1) {
          newCells[row][col] = neighbors === 2 || neighbors === 3 ? 1 : 0;
        } else {
          newCells[row][col] = neighbors === 3 ? 1 : 0;
        }
      }
    }
    cells.length = 0;
    cells.push(...newCells);
    drawCanvas();
  }

  function getSpeed() {
    return maxSpeed - $("#speedSlider").val();
  }

  function toggleSimulation() {
    running = !running;
    if (running) {
      $(this).text("Stop!");
      interval = setInterval(nextIteration, getSpeed())
    } else {
      $(this).text("Start!");
      clearInterval(interval);
    }
  }


  canvas.addEventListener("mousedown", function (event) {
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const clickedCol = Math.floor(mouseX / cellSize);
    const clickedRow = Math.floor(mouseY / cellSize);

    toggleCell(clickedRow, clickedCol, false);
  });

  canvas.addEventListener("mousemove", function (event) {
    if (isDragging) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const currDragCol = Math.floor(mouseX / cellSize);
      const currDragRow = Math.floor(mouseY / cellSize);

      if (currDragRow !== prevDragRow || currDragCol !== prevDragCol) {
        prevDragRow = currDragRow;
        prevDragCol = currDragCol;
        toggleCell(currDragRow, currDragCol, true);
      }
    }
  });

  canvas.addEventListener("mouseup", function () {
    isDragging = false;
  });

  canvas.addEventListener("mouseleave", function () {
    isDragging = false;
  });

  canvas.addEventListener("mouseout", function () {
    hoverRow = -1;
    hoverCol = -1;

    drawCanvas();
  });

  
  $("#toggleButton").on("click", toggleSimulation);
  
  $("#nextButton").on("click", nextIteration);
  
  $("#resetButton").on("click", function () {
    toggleSimulation();
    running = false;
    clearInterval(interval);
    $("#toggleButton").text("Start!");
    cells.length = 0;
    cells.push(...Array.from(Array(numRows), _ => Array(numCols).fill(0)));
    drawCanvas();
  });

  $("#speedSlider").on("input", function () {
    if (running) {
      clearInterval(interval);
      interval = setInterval(nextIteration, getSpeed());
    }
  });
  
  drawCanvas();

});
