
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { SunIcon, MoonIcon, MenuIcon, LaunchIcon } from '../../constants';

interface HeaderProps {
    sectionTitle: string;
    onMenuClick: () => void;
    onLaunchQueue: () => void;
}

const Header: React.FC<HeaderProps> = ({ sectionTitle, onMenuClick, onLaunchQueue }) => {
    const { settings, updateSettings } = useContext(AppContext);

    const toggleDarkMode = () => {
        updateSettings({ darkMode: !settings.darkMode });
    };

    return (
        <header className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700/80 h-16 flex-shrink-0 z-30 transition-colors duration-500">
            <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onMenuClick} className="lg:hidden text-gray-600 dark:text-gray-300">
                        <MenuIcon className="h-6 w-6"/>
                    </button>
                    <h1 className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">
                        {sectionTitle}
                    </h1>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                     <button
                        onClick={onLaunchQueue}
                        className="flex items-center gap-2 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                        aria-label="Launch Queue Display"
                    >
                        <LaunchIcon className="w-5 h-5" />
                        <span className="hidden sm:inline text-sm font-medium">Queue</span>
                    </button>
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                        aria-label="Toggle dark mode"
                    >
                        {settings.darkMode ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-gray-700" />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
