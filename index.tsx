import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './context/AppContext.tsx';
import AuthProvider from './context/AuthContext.tsx';

// Register for global compatibility
window.React = React;

const startApp = () => {
  const container = document.getElementById('root');
  if (!container) return;

  try {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </AuthProvider>
      </React.StrictMode>
    );
    console.log("Clinic Management Suite successfully started.");
  } catch (error) {
    console.error("Critical Error during React initialization:", error);
  }
};

// Handle mounting when ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  startApp();
} else {
  document.addEventListener('DOMContentLoaded', startApp);
}
