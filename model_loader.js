// Model loader for digit recognition
class ModelLoader {
    constructor() {
        this.model = null;
        this.loaded = false;
    }
    
    // Load model from JSON file
    async loadModel(modelPath = 'digit_model.json') {
        try {
            const response = await fetch(modelPath);
            if (!response.ok) {
                throw new Error(`Failed to load model: ${response.status}`);
            }
            
            const modelData = await response.json();
            this.model = modelData;
            this.loaded = true;
            console.log('Model loaded successfully');
            console.log('Model info:', {
                inputSize: this.model.input_size,
                hiddenSizes: this.model.hidden_sizes,
                outputSize: this.model.output_size,
                activation: this.model.activation
            });
            return true;
        } catch (error) {
            console.error('Error loading model:', error);
            return false;
        }
    }
    
    // Predict using the trained model
    predict(input) {
        if (!this.loaded || !this.model) {
            throw new Error('Model not loaded');
        }
        
        console.log('Input length:', input.length);
        console.log('Input sum (drawn pixels):', input.reduce((a, b) => a + b, 0));
        
        // Forward pass through the 3-layer neural network
        // Layer 1: Input -> Hidden1
        const hidden1 = this.forwardPass(input, this.model.weights1, this.model.bias1);
        console.log('Hidden1 layer output length:', hidden1.length);
        console.log('Hidden1 layer sample values:', hidden1.slice(0, 5));
        
        // Layer 2: Hidden1 -> Hidden2
        const hidden2 = this.forwardPass(hidden1, this.model.weights2, this.model.bias2);
        console.log('Hidden2 layer output length:', hidden2.length);
        console.log('Hidden2 layer sample values:', hidden2.slice(0, 5));
        
        // Layer 3: Hidden2 -> Output (no activation on output layer for softmax)
        const output = this.linearPass(hidden2, this.model.weights3, this.model.bias3);
        console.log('Output layer length:', output.length);
        console.log('Raw output values:', output);
        
        // Apply softmax to get probabilities
        const probabilities = this.softmax(output);
        console.log('Probabilities:', probabilities);
        
        // Find the digit with highest probability
        let maxIndex = 0;
        let maxValue = probabilities[0];
        for (let i = 1; i < probabilities.length; i++) {
            if (probabilities[i] > maxValue) {
                maxValue = probabilities[i];
                maxIndex = i;
            }
        }
        
        console.log('Predicted digit:', maxIndex, 'Confidence:', maxValue);
        
        return {
            digit: maxIndex,
            confidence: maxValue,
            probabilities: probabilities
        };
    }
    
    // Forward pass through a layer with ReLU activation
    forwardPass(input, weights, bias) {
        const output = [];
        for (let i = 0; i < weights[0].length; i++) {
            let sum = bias[i];
            for (let j = 0; j < input.length; j++) {
                sum += input[j] * weights[j][i];
            }
            output.push(this.relu(sum)); // Using ReLU activation
        }
        return output;
    }
    
    // Linear pass through a layer (no activation - for output layer)
    linearPass(input, weights, bias) {
        const output = [];
        for (let i = 0; i < weights[0].length; i++) {
            let sum = bias[i];
            for (let j = 0; j < input.length; j++) {
                sum += input[j] * weights[j][i];
            }
            output.push(sum); // No activation for output layer
        }
        return output;
    }
    
    // ReLU activation function
    relu(x) {
        return Math.max(0, x);
    }
    
    // Softmax function to convert outputs to probabilities
    softmax(x) {
        const max = Math.max(...x);
        const exp = x.map(val => Math.exp(val - max));
        const sum = exp.reduce((a, b) => a + b, 0);
        return exp.map(val => val / sum);
    }
}

// Global model instance
const modelLoader = new ModelLoader(); 