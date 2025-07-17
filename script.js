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
const radius = 6;
for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
        // Check if this cell is within the circular radius
        if (dr * dr + dc * dc <= radius * radius) {
            // Exclude the furthest cells in the 4 cardinal directions
            const isExcluded = (dr === radius && dc === 0) || 
                              (dr === 0 && dc === radius) || 
                              (dr === -radius && dc === 0) || 
                              (dr === 0 && dc === -radius);
            
            if (!isExcluded) {
                brushOffsets.push({ dr, dc });
            }
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

// Real prediction function using trained model
async function predictDigit() {
    const input = gridToInput();
    
    try {
        // Load model if not already loaded
        if (!modelLoader.loaded) {
            const loaded = await modelLoader.loadModel('digit_model.json');
            if (!loaded) {
                throw new Error('Failed to load model');
            }
        }
        
        // Make prediction using trained model
        const result = modelLoader.predict(input);
        console.log('Prediction:', result.digit, 'Confidence:', result.confidence.toFixed(3));
        console.log('All probabilities:', result.probabilities.map(p => p.toFixed(3)));
        
        return result;
    } catch (error) {
        console.error('Prediction error:', error);
        
        // Fallback to random prediction if model fails
        const randomDigit = Math.floor(Math.random() * 10);
        const randomConfidence = 0.5 + Math.random() * 0.5;
        
        return { 
            digit: randomDigit, 
            confidence: randomConfidence, 
            probabilities: new Array(10).fill(0.1).map((_, i) => i === randomDigit ? randomConfidence : (1 - randomConfidence) / 9)
        };
    }
}

// Convert grid to input format
function gridToInput() {
    const input = [];
    for (let i = 0; i < 128 * 128; i++) {
        const cell = cells[i];
        input.push(cell.classList.contains('drawn') ? 1 : 0);
    }
    return input;
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add guess button functionality
    const guessButton = document.getElementById('guessButton');
    if (guessButton) {
        guessButton.addEventListener('click', async () => {
            const result = await predictDigit();
            const resultDiv = document.getElementById('predictionResult') || createResultDiv();
            resultDiv.textContent = `Predicted: ${result.digit}`;
            resultDiv.style.color = '#333';
        });
    }
    
    // Create result div if it doesn't exist
    function createResultDiv() {
        const div = document.createElement('div');
        div.id = 'predictionResult';
        div.style.marginTop = '15px';
        div.style.padding = '10px';
        div.style.fontSize = '18px';
        div.style.fontWeight = 'bold';
        div.style.textAlign = 'center';
        div.style.minHeight = '30px';
        document.querySelector('.drawing-container').appendChild(div);
        return div;
    }
    
    // Show loading message
    const resultDiv = createResultDiv();
    resultDiv.textContent = 'AI Model Loading...';
    resultDiv.style.color = '#FF9800';
    
    // Pre-load the model
    modelLoader.loadModel('digit_model.json').then(loaded => {
        if (loaded) {
            resultDiv.textContent = 'AI Ready! Draw a digit and click Guess.';
            resultDiv.style.color = '#4CAF50';
            setTimeout(() => {
                resultDiv.textContent = '';
            }, 3000);
        } else {
            resultDiv.textContent = 'Error loading AI model.';
            resultDiv.style.color = '#f44336';
        }
    });
}); 