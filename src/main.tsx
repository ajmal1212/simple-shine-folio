import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('main.tsx loading...');
console.log('React:', React);
console.log('ReactDOM:', ReactDOM);

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(container);
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(App)
  )
);