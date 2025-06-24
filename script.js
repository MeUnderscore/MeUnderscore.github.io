// Create the 128x128 grid
const drawingGrid = document.getElementById('drawingGrid');

for (let i = 0; i < 128 * 128; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    drawingGrid.appendChild(cell);
}

// Drawing functionality
let isDrawing = false;
let lastDrawnCell = null;
const cells = document.querySelectorAll('.grid-cell');

// Pre-calculate cell positions for faster lookup
const cellPositions = new Map();
cells.forEach((cell, index) => {
    const row = Math.floor(index / 128);
    const col = index % 128;
    cellPositions.set(cell, { row, col, index });
});

// Pre-calculate adjacent cell offsets for circular brush
const brushOffsets = [];
const radius = 7;
for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
        if (dr * dr + dc * dc <= radius * radius) {
            brushOffsets.push({ dr, dc });
        }
    }
}

// Function to get adjacent cells (optimized)
function getAdjacentCells(cell) {
    const adjacent = [];
    const pos = cellPositions.get(cell);
    if (!pos) return adjacent;
    
    for (const { dr, dc } of brushOffsets) {
        const newRow = pos.row + dr;
        const newCol = pos.col + dc;
        
        if (newRow >= 0 && newRow < 128 && newCol >= 0 && newCol < 128) {
            const adjacentIndex = newRow * 128 + newCol;
            adjacent.push(cells[adjacentIndex]);
        }
    }
    
    return adjacent;
}

// Optimized line drawing using Bresenham's algorithm
function getCellsBetween(cell1, cell2) {
    const pos1 = cellPositions.get(cell1);
    const pos2 = cellPositions.get(cell2);
    if (!pos1 || !pos2) return [];
    
    const cellsBetween = [];
    let x0 = pos1.col, y0 = pos1.row;
    let x1 = pos2.col, y1 = pos2.row;
    
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    
    while (true) {
        if (x0 >= 0 && x0 < 128 && y0 >= 0 && y0 < 128) {
            const cellIndex = y0 * 128 + x0;
            cellsBetween.push(cells[cellIndex]);
        }
        
        if (x0 === x1 && y0 === y1) break;
        
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
    
    return cellsBetween;
}

// Optimized drawing function
function drawOnCell(cell) {
    if (cell.classList.contains('drawn')) return; // Skip if already drawn
    
    cell.classList.add('drawn');
    const adjacent = getAdjacentCells(cell);
    adjacent.forEach(adjCell => {
        if (!adjCell.classList.contains('drawn')) {
            adjCell.classList.add('drawn');
        }
    });
}

// Optimized line drawing
function drawLineBetween(cell1, cell2) {
    const cellsBetween = getCellsBetween(cell1, cell2);
    cellsBetween.forEach(cell => {
        // Always draw on interpolated cells, even if already drawn
        cell.classList.add('drawn');
        const adjacent = getAdjacentCells(cell);
        adjacent.forEach(adjCell => {
            adjCell.classList.add('drawn');
        });
    });
}

// Global mouse event listeners to ensure proper state tracking
document.addEventListener('mouseup', () => {
    isDrawing = false;
    lastDrawnCell = null;
});

document.addEventListener('mouseleave', () => {
    isDrawing = false;
    lastDrawnCell = null;
});

drawingGrid.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Prevent default behavior
    isDrawing = true;
});

cells.forEach(cell => {
    cell.addEventListener('mouseenter', () => {
        if (isDrawing) {
            if (lastDrawnCell && lastDrawnCell !== cell) {
                drawLineBetween(lastDrawnCell, cell);
            } else {
                drawOnCell(cell);
            }
            lastDrawnCell = cell;
        }
    });
    
    cell.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent default behavior
        drawOnCell(cell);
        lastDrawnCell = cell;
    });
});

// Clear button functionality
document.getElementById('clearButton').addEventListener('click', () => {
    cells.forEach(cell => {
        cell.classList.remove('drawn');
    });
}); 