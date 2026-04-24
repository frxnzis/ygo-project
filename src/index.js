import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const ignoredResizeObserverErrors = [
  'ResizeObserver loop completed with undelivered notifications.',
  'ResizeObserver loop limit exceeded'
];

window.addEventListener('error', (event) => {
  if (ignoredResizeObserverErrors.includes(event.message)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});

window.onerror = (message) => {
  if (ignoredResizeObserverErrors.includes(message)) {
    return true;
  }

  return false;
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
