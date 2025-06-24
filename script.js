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

// Simple Neural Network for digit recognition
class SimpleNeuralNetwork {
    constructor(inputSize, hiddenSize, outputSize) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;
        
        // Initialize weights randomly
        this.weights1 = this.randomMatrix(inputSize, hiddenSize);
        this.weights2 = this.randomMatrix(hiddenSize, outputSize);
        this.bias1 = this.randomMatrix(1, hiddenSize);
        this.bias2 = this.randomMatrix(1, outputSize);
        
        this.learningRate = 0.1;
    }
    
    randomMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = Math.random() * 2 - 1; // Random values between -1 and 1
            }
        }
        return matrix;
    }
    
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    
    sigmoidDerivative(x) {
        return x * (1 - x);
    }
    
    forward(input) {
        // Hidden layer
        const hidden = this.multiply(input, this.weights1);
        const hiddenWithBias = this.add(hidden, this.bias1);
        const hiddenOutput = hiddenWithBias.map(row => row.map(val => this.sigmoid(val)));
        
        // Output layer
        const output = this.multiply(hiddenOutput, this.weights2);
        const outputWithBias = this.add(output, this.bias2);
        const finalOutput = outputWithBias.map(row => row.map(val => this.sigmoid(val)));
        
        return { hiddenOutput, finalOutput };
    }
    
    multiply(a, b) {
        const result = [];
        for (let i = 0; i < a.length; i++) {
            result[i] = [];
            for (let j = 0; j < b[0].length; j++) {
                result[i][j] = 0;
                for (let k = 0; k < a[0].length; k++) {
                    result[i][j] += a[i][k] * b[k][j];
                }
            }
        }
        return result;
    }
    
    add(a, b) {
        return a.map((row, i) => row.map((val, j) => val + b[0][j]));
    }
    
    transpose(matrix) {
        const result = [];
        for (let i = 0; i < matrix[0].length; i++) {
            result[i] = [];
            for (let j = 0; j < matrix.length; j++) {
                result[i][j] = matrix[j][i];
            }
        }
        return result;
    }
    
    train(input, target) {
        // Forward pass
        const { hiddenOutput, finalOutput } = this.forward(input);
        
        // Calculate errors
        const outputError = this.subtract(target, finalOutput);
        const outputDelta = outputError.map(row => row.map(val => val * this.sigmoidDerivative(val)));
        
        const hiddenError = this.multiply(outputDelta, this.transpose(this.weights2));
        const hiddenDelta = hiddenError.map(row => row.map(val => val * this.sigmoidDerivative(val)));
        
        // Update weights
        const hiddenTranspose = this.transpose(hiddenOutput);
        const inputTranspose = this.transpose(input);
        
        const weight2Update = this.multiply(hiddenTranspose, outputDelta);
        const weight1Update = this.multiply(inputTranspose, hiddenDelta);
        
        this.weights2 = this.add(this.weights2, this.scalarMultiply(weight2Update, this.learningRate));
        this.weights1 = this.add(this.weights1, this.scalarMultiply(weight1Update, this.learningRate));
        
        // Update biases
        this.bias2 = this.add(this.bias2, this.scalarMultiply(outputDelta, this.learningRate));
        this.bias1 = this.add(this.bias1, this.scalarMultiply(hiddenDelta, this.learningRate));
    }
    
    subtract(a, b) {
        return a.map((row, i) => row.map((val, j) => val - b[i][j]));
    }
    
    scalarMultiply(matrix, scalar) {
        return matrix.map(row => row.map(val => val * scalar));
    }
    
    predict(input) {
        const { finalOutput } = this.forward(input);
        return finalOutput[0];
    }
}

// Convert grid to neural network input
function gridToInput() {
    const input = [];
    for (let i = 0; i < 128 * 128; i++) {
        const cell = cells[i];
        input.push(cell.classList.contains('drawn') ? 1 : 0);
    }
    return [input]; // Wrap in array for matrix operations
}

// Create target output for a specific digit (0-9)
function createTarget(digit) {
    const target = new Array(10).fill(0);
    target[digit] = 1;
    return [target];
}

// Initialize neural network
const inputSize = 128 * 128; // 16384 input neurons (one for each cell)
const hiddenSize = 64; // Hidden layer size
const outputSize = 10; // 10 output neurons (one for each digit 0-9)
const neuralNetwork = new SimpleNeuralNetwork(inputSize, hiddenSize, outputSize);

// Training data (you can expand this with more examples)
const trainingData = [
    // Add your training examples here
    // Example: { input: gridToInput(), target: createTarget(5) }
];

// Train the network
function trainNetwork() {
    console.log('Training network...');
    for (let epoch = 0; epoch < 100; epoch++) {
        for (const data of trainingData) {
            neuralNetwork.train(data.input, data.target);
        }
    }
    console.log('Training complete!');
}

// Predict the digit
function predictDigit() {
    const input = gridToInput();
    const prediction = neuralNetwork.predict(input);
    
    // Find the digit with highest probability
    let maxIndex = 0;
    let maxValue = prediction[0];
    for (let i = 1; i < prediction.length; i++) {
        if (prediction[i] > maxValue) {
            maxValue = prediction[i];
            maxIndex = i;
        }
    }
    
    console.log('Prediction:', maxIndex, 'Confidence:', maxValue.toFixed(3));
    console.log('All probabilities:', prediction.map(p => p.toFixed(3)));
    
    return { digit: maxIndex, confidence: maxValue, probabilities: prediction };
}

// Add prediction button functionality
document.getElementById('predictButton').addEventListener('click', () => {
    const result = predictDigit();
    document.getElementById('predictionResult').textContent = 
        `Predicted: ${result.digit} (Confidence: ${(result.confidence * 100).toFixed(1)}%)`;
});

// Add training example functionality
document.getElementById('addTrainingButton').addEventListener('click', () => {
    const digitInput = document.getElementById('trainingDigit');
    const digit = parseInt(digitInput.value);
    
    if (isNaN(digit) || digit < 0 || digit > 9) {
        alert('Please enter a valid digit (0-9)');
        return;
    }
    
    const input = gridToInput();
    const target = createTarget(digit);
    
    trainingData.push({ input, target });
    
    document.getElementById('trainingStatus').textContent = 
        `Added training example for digit ${digit}. Total examples: ${trainingData.length}`;
    
    digitInput.value = '';
});

// Train network functionality
document.getElementById('trainButton').addEventListener('click', () => {
    if (trainingData.length === 0) {
        alert('Please add some training examples first!');
        return;
    }
    
    const trainButton = document.getElementById('trainButton');
    const trainingStatus = document.getElementById('trainingStatus');
    
    trainButton.disabled = true;
    trainButton.textContent = 'Training...';
    
    // Train in batches to avoid blocking the UI
    let epoch = 0;
    const totalEpochs = 100;
    
    function trainBatch() {
        for (let i = 0; i < 10; i++) { // Train 10 epochs at a time
            if (epoch >= totalEpochs) {
                trainingStatus.textContent = 'Training complete!';
                trainButton.disabled = false;
                trainButton.textContent = 'Train Network';
                return;
            }
            
            for (const data of trainingData) {
                neuralNetwork.train(data.input, data.target);
            }
            epoch++;
        }
        
        trainingStatus.textContent = `Training... ${epoch}/${totalEpochs} epochs complete`;
        setTimeout(trainBatch, 10); // Continue training after 10ms
    }
    
    trainBatch();
}); 