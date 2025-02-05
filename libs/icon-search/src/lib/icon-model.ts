// Lightweight AI model for icon lookup using brain.js

import { NeuralNetwork } from 'brain.js';

// Encode text to a 26-length normalized frequency vector (a simple bag-of-letters approach)
function encodeText(text: string): number[] {
  text = text.toLowerCase().replace(/[^a-z]/g, '');
  const vector = new Array(26).fill(0);
  for (const char of text) {
    const index = char.charCodeAt(0) - 97;
    if (index >= 0 && index < 26) {
      vector[index] += 1;
    }
  }
  const sum = vector.reduce((a, b) => a + b, 0);
  return vector.map((v) => (sum ? v / sum : 0));
}

// Icon labels and their corresponding icon symbols
const iconLabels = ['search', 'user', 'home', 'settings', 'email'];
const iconMapping: { [key: string]: string } = {
  search: '🔍',
  user: '👤',
  home: '🏠',
  settings: '⚙️',
  email: '✉️',
};

// Training samples with text and corresponding icon label
const trainingData = [
  { text: 'find', label: 'search' },
  { text: 'look up', label: 'search' },
  { text: 'profile', label: 'user' },
  { text: 'house', label: 'home' },
  { text: 'configure', label: 'settings' },
  { text: 'mail', label: 'email' },
  // ...additional training samples...
];

// Prepare data for brain.js (one-hot output for each label)
const preparedData = trainingData.map((item) => ({
  input: encodeText(item.text),
  output: iconLabels.reduce(
    (acc, key) => {
      acc[key] = key === item.label ? 1 : 0;
      return acc;
    },
    {} as { [key: string]: number },
  ),
}));

// Create and train the neural network
const net = new NeuralNetwork();
net.train(preparedData, {
  iterations: 2000,
  errorThresh: 0.005,
});

// Predict function that returns an icon based on the trained model output
export function predictIcon(query: string): string {
  const input = encodeText(query);
  const output = net.run(input);
  let bestKey = '';
  let bestVal = 0;
  for (const key of iconLabels) {
    if (output[key] > bestVal) {
      bestVal = output[key];
      bestKey = key;
    }
  }
  return iconMapping[bestKey] || 'No matching icon';
}
