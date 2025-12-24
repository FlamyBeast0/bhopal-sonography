import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './context/AppContext.tsx';
import AuthProvider from './context/AuthContext.tsx';

// Register for global compatibility
window.React = React;
window.ReactDOM = ReactDOM as any;

const mountApp = () => {
  const container = document.getElementById('root');
  if (!container) return;

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
};

// Handle mounting when ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  mountApp();
} else {
  document.addEventListener('DOMContentLoaded', mountApp);
}
