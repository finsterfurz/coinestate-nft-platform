import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Vite entry point
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring
// Pass a function to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint
if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
  reportWebVitals(console.log);
} else {
  reportWebVitals();
}

// Hot Module Replacement (HMR) for development
if (import.meta.hot) {
  import.meta.hot.accept('./App', () => {
    // Re-render the app when App.jsx changes
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
}
