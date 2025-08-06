
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('React version:', React.version);
console.log('Main.tsx loading...');

const container = document.getElementById("root");
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
console.log('Root created, rendering App...');
root.render(<App />);
