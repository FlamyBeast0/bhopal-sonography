
import React from 'react';
import ReactDOMClient from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './context/AppContext.tsx';
import AuthProvider from './context/AuthContext.tsx';

// Set globals for library compatibility
window.React = React;
// Some older libraries expect the full ReactDOM object on the global
const ReactDOMShim = {
  createRoot: ReactDOMClient.createRoot,
  hydrateRoot: ReactDOMClient.hydrateRoot
};
window.ReactDOM = ReactDOMShim as any;

const startApp = () => {
  const container = document.getElementById('root');
  if (!container) return;

  try {
    const root = ReactDOMClient.createRoot(container);
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </AuthProvider>
      </React.StrictMode>
    );
    console.log("Clinic Management Suite Initialized.");
  } catch (error) {
    console.error("Failed to mount React application:", error);
  }
};

// Mount when DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  startApp();
} else {
  document.addEventListener('DOMContentLoaded', startApp);
}
