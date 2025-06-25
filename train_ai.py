import numpy as np
import json
import pickle
import os
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

class DigitRecognizer:
    def __init__(self):
        # Initialize MLPClassifier (Multi-layer Perceptron)
        self.model = MLPClassifier(
            hidden_layer_sizes=(128, 64),  # Two hidden layers
            activation='relu',
            solver='adam',
            alpha=0.0001,
            batch_size='auto',
            learning_rate='adaptive',
            learning_rate_init=0.001,
            max_iter=1000,
            random_state=42,
            verbose=True
        )
        self.trained = False
    
    def load_training_data(self, data_folder='training_data'):
        """Load training data from multiple JSON files in a folder"""
        X = []  # Input features (grid data)
        y = []  # Labels (digits)
        
        if not os.path.exists(data_folder):
            print(f"Training data folder '{data_folder}' not found.")
            return None, None
        
        # Load all JSON files in the training_data folder
        json_files = [f for f in os.listdir(data_folder) if f.endswith('.json')]
        
        if not json_files:
            print(f"No JSON files found in '{data_folder}' folder.")
            return None, None
        
        total_examples = 0
        digit_counts = {}
        
        for json_file in json_files:
            file_path = os.path.join(data_folder, json_file)
            print(f"Loading data from {json_file}...")
            
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                
                for example in data:
                    X.append(example['input'][0])  # Flatten the input
                    # Find the digit label (which position has 1)
                    label = example['target'][0].index(1)
                    y.append(label)
                    
                    # Count examples per digit
                    digit_counts[label] = digit_counts.get(label, 0) + 1
                
                total_examples += len(data)
                print(f"  Loaded {len(data)} examples from {json_file}")
                
            except Exception as e:
                print(f"  Error loading {json_file}: {e}")
                continue
        
        print(f"\nTotal examples loaded: {total_examples}")
        print("Training data distribution:")
        for digit in sorted(digit_counts.keys()):
            print(f"  Digit {digit}: {digit_counts[digit]} examples")
        
        return np.array(X), np.array(y)
    
    def train(self, X, y):
        """Train the model"""
        print(f"Training with {len(X)} examples...")
        print(f"Input shape: {X.shape}")
        print(f"Labels shape: {y.shape}")
        
        # Split data into training and validation sets
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train the model
        self.model.fit(X_train, y_train)
        
        # Evaluate on validation set
        y_pred = self.model.predict(X_val)
        accuracy = accuracy_score(y_val, y_pred)
        
        print(f"Validation Accuracy: {accuracy:.4f}")
        print("\nClassification Report:")
        print(classification_report(y_val, y_pred))
        
        self.trained = True
        return accuracy
    
    def predict(self, grid_data):
        """Predict digit from grid data"""
        if not self.trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Ensure input is the right shape
        if isinstance(grid_data, list):
            grid_data = np.array(grid_data).reshape(1, -1)
        
        prediction = self.model.predict(grid_data)[0]
        probabilities = self.model.predict_proba(grid_data)[0]
        
        return {
            'digit': int(prediction),
            'confidence': float(max(probabilities)),
            'probabilities': probabilities.tolist()
        }
    
    def save_model(self, filename='digit_model.pkl'):
        """Save the trained model"""
        with open(filename, 'wb') as f:
            pickle.dump(self.model, f)
        print(f"Model saved to {filename}")
    
    def save_model_json(self, filename='digit_model.json'):
        """Save the trained model in JSON format for web use"""
        model_data = {
            'model_type': 'MLPClassifier',
            'input_size': self.model.n_features_in_,
            'hidden_sizes': self.model.hidden_layer_sizes,
            'output_size': self.model.n_outputs_,
            'activation': self.model.activation,
            'weights1': self.model.coefs_[0].tolist(),  # Input -> Hidden1
            'weights2': self.model.coefs_[1].tolist(),  # Hidden1 -> Hidden2
            'weights3': self.model.coefs_[2].tolist(),  # Hidden2 -> Output
            'bias1': self.model.intercepts_[0].tolist(),
            'bias2': self.model.intercepts_[1].tolist(),
            'bias3': self.model.intercepts_[2].tolist(),
            'classes': self.model.classes_.tolist()
        }
        
        with open(filename, 'w') as f:
            json.dump(model_data, f, indent=2)
        
        print(f"Model saved to {filename} (JSON format for web)")
    
    def load_model(self, filename='digit_model.pkl'):
        """Load a trained model"""
        with open(filename, 'rb') as f:
            self.model = pickle.load(f)
        self.trained = True
        print(f"Model loaded from {filename}")

def main():
    print("=== Digit Recognition AI Training ===")
    print("This script will:")
    print("1. Load training data from the 'training_data' folder")
    print("2. Train a neural network model")
    print("3. Save the model in JSON format for web use")
    print()
    
    # Initialize the recognizer
    recognizer = DigitRecognizer()
    
    # Load training data
    X, y = recognizer.load_training_data('training_data')
    
    if X is not None and y is not None and len(X) > 0:
        # Train the model
        accuracy = recognizer.train(X, y)
        
        # Save the trained model in JSON format for web use
        recognizer.save_model_json('digit_model.json')
        
        print(f"\nTraining complete! Model accuracy: {accuracy:.4f}")
        print("Model saved as digit_model.json (ready for web use)")
        
        # Test prediction
        test_input = X[0].reshape(1, -1)
        result = recognizer.predict(test_input)
        print(f"\nTest prediction: {result}")
        
    else:
        print("No training data found!")
        print("\nTo collect training data:")
        print("1. Open index.html in your browser")
        print("2. Draw digits and click the corresponding buttons (0-9)")
        print("3. When localStorage is full, copy the data")
        print("4. Create a 'training_data' folder and save JSON files there")
        print("5. Run this script again")

if __name__ == "__main__":
    main() 