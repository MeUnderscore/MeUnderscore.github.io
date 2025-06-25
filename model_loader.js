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
        
        // Forward pass through the neural network
        const hidden = this.forwardPass(input, this.model.weights1, this.model.bias1);
        const output = this.forwardPass(hidden, this.model.weights2, this.model.bias2);
        
        // Apply softmax to get probabilities
        const probabilities = this.softmax(output);
        
        // Find the digit with highest probability
        let maxIndex = 0;
        let maxValue = probabilities[0];
        for (let i = 1; i < probabilities.length; i++) {
            if (probabilities[i] > maxValue) {
                maxValue = probabilities[i];
                maxIndex = i;
            }
        }
        
        return {
            digit: maxIndex,
            confidence: maxValue,
            probabilities: probabilities
        };
    }
    
    // Forward pass through a layer
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