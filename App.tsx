
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from './context/AppContext';
import { AuthContext } from './context/AuthContext';
import { THEMES, SIDEBAR_ITEMS } from './constants';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/sections/Dashboard';
import NewEntry from './components/sections/NewEntry';
import Patients from './components/sections/Patients';
import Billing from './components/sections/Billing';
import Expenses from './components/sections/Expenses';
import Referrals from './components/sections/Referrals';
import RateCard from './components/sections/RateCard';
import Reports from './components/sections/Reports';
import Settings from './components/sections/Settings';
import PatientQueue from './components/sections/PatientQueue';
import LoginPage from './components/pages/LoginPage';
import ToastContainer from './components/ui/ToastContainer';
import { PlusIcon as FloatingActionButtonIcon } from './constants';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('Dashboard');
  const { settings } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Apply theme and mode classes to the body
    const body = document.body;
    body.className = `bg-slate-100 dark:bg-gray-900 transition-colors duration-500`;
    
    const rootHtml = document.documentElement;
    if (settings.darkMode) {
      rootHtml.classList.add('dark');
    } else {
      rootHtml.classList.remove('dark');
    }

    const hexToRgb = (hex: string): string => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '102, 126, 234';
    };

    // Inject theme colors
    const theme = THEMES.find(t => t.name === settings.theme);
    if (theme) {
        const styleId = 'app-theme-variables';
        let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = styleId;
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = `
            :root {
                --color-primary-300: ${theme.to}99;
                --color-primary-400: ${theme.to}CC;
                --color-primary-500: ${theme.to};
                --color-primary-600: ${theme.from};
                --color-primary-700: ${theme.from}DD;
                --color-primary-rgb: ${hexToRgb(theme.from)};
            }
        `;
    }
  }, [settings]);

  // Route Protection
  useEffect(() => {
    if (user) {
        const menuItem = SIDEBAR_ITEMS.find(item => item.name === activeSection);
        if (menuItem && !menuItem.allowedRoles.includes(user.role)) {
            setActiveSection('Dashboard');
        }
    }
  }, [activeSection, user]);

  if (!user) {
    return <LoginPage />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'Dashboard':
        return <Dashboard setActiveSection={setActiveSection} />;
      case 'New Entry':
        return <NewEntry setActiveSection={setActiveSection} />;
      case 'Patients':
        return <Patients />;
      case 'Billing':
        return <Billing />;
      case 'Expenses':
        return <Expenses />;
      case 'Referrals':
        return <Referrals />;
      case 'Rate Card':
        return <RateCard />;
      case 'Reports':
        return <Reports />;
      case 'Settings':
        return <Settings />;
      default:
        return <Dashboard setActiveSection={setActiveSection} />;
    }
  };
  
  const handleFabClick = () => {
    setActiveSection('New Entry');
  };

  if (activeSection === 'Patient Queue') {
    return <PatientQueue setActiveSection={setActiveSection} />;
  }

  return (
    <div className="flex h-screen font-sans">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            sectionTitle={activeSection} 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            onLaunchQueue={() => setActiveSection('Patient Queue')}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-100 dark:bg-gray-900">
          <div className="animate-fade-in">
            {renderSection()}
          </div>
        </main>
      </div>
      <ToastContainer />
       <button
          onClick={handleFabClick}
          aria-label="New Patient Entry"
          className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-700 transition-all duration-300 ease-in-out transform hover:scale-110 flex items-center justify-center"
        >
          <FloatingActionButtonIcon className="w-8 h-8" />
        </button>
    </div>
  );
};

export default App;
