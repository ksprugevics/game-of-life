$(document).ready(function () {
  const canvas = document.getElementById("myCanvas");
  const context = canvas.getContext("2d");

  const cellSize = 18;
  const scale = window.devicePixelRatio;

  const numRows = parseInt(window.innerHeight / cellSize - 15);
  const numCols = parseInt(window.innerWidth / cellSize - 10);

  const deadColor = "#FAF1E4"
  const aliveColor = "#435334"
  const hoverColor = "grey"

  const cells = Array.from(Array(numRows), _ => Array(numCols).fill(0));
  let initialCellSetup;
  let iteration = 0;

  canvas.style.width = numCols * cellSize + "px";
  canvas.style.height = numRows * cellSize + "px";

  canvas.width = numCols * cellSize * scale;
  canvas.height = numRows * cellSize * scale;

  context.scale(scale, scale);

  let hoverOriginRow = -1;
  let hoverOriginCol = -1;
  let hoverRows = []
  let hoverCols = []
  
  const maxSpeed = 1000;
  let brushSize = 1;

  let isDragging = false;
  let isDeleting = false;
  let prevDragRow = -1;
  let prevDragCol = -1;

  let running = false;
  let interval;


  function drawCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    calculateHoverCells()
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const x = col * cellSize;
        const y = row * cellSize;

        let cellColor = deadColor;

        if (cells[row][col] == 1) {
          cellColor = aliveColor;
        }

        if (brushSize > 1) {
          for (let i = 0; i < hoverRows.length; i++) {
            if (hoverRows[i] == row && hoverCols[i] == col) {
              cellColor = hoverColor;
            }
          }
        } else if (row === hoverOriginRow && col === hoverOriginCol) {
          cellColor = hoverColor;
        }

        context.fillStyle = cellColor;
        context.fillRect(x, y, cellSize, cellSize);

        context.strokeStyle = aliveColor;
        context.strokeRect(x, y, cellSize, cellSize);
      }
    }
  }

  function calculateHoverCells() {
    hoverRows = []
    hoverCols = []
    if (brushSize > 1  && hoverOriginRow >= 0 && hoverOriginCol >= 0) {
      for (let i = hoverOriginRow; i < hoverOriginRow + brushSize; i++) {
        for (let j = hoverOriginCol; j < hoverOriginCol + brushSize; j++) {
          if (i >= 0 && i < numRows && j >= 0 && j < numCols) {
            hoverRows.push(i);
            hoverCols.push(j);
          }
        }
      }
    }
  }

  function brushedAddCell(row, col) {
    for (let i = row; i < row + brushSize; i++) {
      for (let j = col; j < col + brushSize; j++) {
        if (i >= 0 && i < numRows && j >= 0 && j < numCols) {
          cells[i][j] = 1;
        }
      }
    }
    drawCanvas();
  }

  function brushedDeleteCell(row, col) {
    for (let i = row; i < row + brushSize; i++) {
      for (let j = col; j < col + brushSize; j++) {
        if (i >= 0 && i < numRows && j >= 0 && j < numCols) {
          cells[i][j] = 0;
        }
      }
    }
    drawCanvas();
  }

  function brushedToggleCell(row, col) {
    for (let i = row; i < row + brushSize; i++) {
      for (let j = col; j < col + brushSize; j++) {
        if (i >= 0 && i < numRows && j >= 0 && j < numCols) {
          cells[i][j] = cells[i][j] === 0 ? 1 : 0;
        }
      }
    }
    drawCanvas();
  }

  function nextIteration() {
    if (iteration == 0) {
      initialCellSetup = cells.slice();
    }

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
    iteration += 1;
    cells.length = 0;
    cells.push(...newCells);
    drawCanvas();
  }
  
  function countLiveNeighbours(row, col) {
    let liveNeighbors = 0;

    const neighborsOffsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

    for (const offset of neighborsOffsets) {
      const newRow = row + offset[0];
      const newCol = col + offset[1];

      if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
        liveNeighbors += cells[newRow][newCol];
      }
    }

    return liveNeighbors;
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

    brushedToggleCell(clickedRow, clickedCol);
  });

  canvas.addEventListener("mousemove", function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    if (isDragging) {

      const currDragCol = Math.floor(mouseX / cellSize);
      const currDragRow = Math.floor(mouseY / cellSize);

      if (currDragRow !== prevDragRow || currDragCol !== prevDragCol) {
        prevDragRow = currDragRow;
        prevDragCol = currDragCol;
        if (isDeleting) {
            brushedDeleteCell(currDragRow, currDragCol);
        } else {
            brushedAddCell(currDragRow, currDragCol);
        }
      }
    }
    hoverOriginCol = Math.floor(mouseX / cellSize);
    hoverOriginRow = Math.floor(mouseY / cellSize);
    drawCanvas();
  });

  canvas.addEventListener("mouseup", function () {
    isDragging = false;
  });

  canvas.addEventListener("mouseleave", function () {
    isDragging = false;
  });

  canvas.addEventListener("mouseout", function () {
    hoverOriginRow = -1;
    hoverOriginCol = -1;
    drawCanvas();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "x") {
      isDeleting = true;
    }
  });

  document.addEventListener("keyup", function (event) {
    if (event.key === "x") {
      isDeleting = false;
    }
  });


  $("#toggleButton").on("click", toggleSimulation);

  $("#nextButton").on("click", nextIteration);

  $("#resetButton").on("click", function () {
    toggleSimulation();
    iteration = 0;
    running = false;
    clearInterval(interval);
    $("#toggleButton").text("Start!");
    cells.length = 0;
    cells.push(...initialCellSetup);
    drawCanvas();
  });

  $("#clearButton").on("click", function () {
    toggleSimulation();
    iteration = 0;
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

  $("#brushDecrementButton").on("click", function () {
    let newBrushSize = brushSize / 2;

    if (newBrushSize < 1) {
      return;
    }
    $("#brushSizeLabel").text(newBrushSize);
    brushSize = newBrushSize;
  });

  $("#brushIncrementButton").on("click", function () {
    let newBrushSize = brushSize * 2;

    if (newBrushSize > 16) {
      return;
    }

    $("#brushSizeLabel").text(newBrushSize);
    brushSize = newBrushSize;
  });

  drawCanvas();

});
