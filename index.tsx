

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './context/AppContext.tsx';
import AuthProvider from './context/AuthContext.tsx';

// Register React globally for libraries that expect it there
window.React = React;
// Fix: Cast to any to resolve mismatch between react-dom/client subset and full react-dom global type
window.ReactDOM = ReactDOM as any;

const initApp = () => {
  const container = document.getElementById('root');
  if (!container) return;

  const root = ReactDOM.createRoot(container);
  root.render(
    <AuthProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AuthProvider>
  );
};

// Start application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
