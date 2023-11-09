import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { SnackbarProvider } from 'notistack';

// Assuming that your HTML has a div with an ID of 'root'
const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}
