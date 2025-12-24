
import React, { useContext } from 'react';
import { SIDEBAR_ITEMS, LogoutIcon } from '../../constants';
import { AuthContext } from '../../context/AuthContext';


interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, isSidebarOpen, setIsSidebarOpen }) => {
  const { logout, user } = useContext(AuthContext);
  
  const handleItemClick = (name: string) => {
    setActiveSection(name);
    setIsSidebarOpen(false); // Close sidebar on item click for mobile
  };

  const visibleItems = SIDEBAR_ITEMS.filter(item => 
    user && item.allowedRoles.includes(user.role)
  );
  
  return (
    <>
        <aside className={`absolute lg:relative z-40 w-64 bg-gradient-to-b from-primary-600 to-primary-500 text-white flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 shadow-2xl`}>
            <div className="h-16 flex items-center justify-center px-4 border-b border-white/20">
                <h2 className="text-2xl font-bold tracking-wider">🩺 BSC</h2>
            </div>
            <div className="px-4 py-3 bg-white/10 text-center">
                <p className="text-xs font-medium text-white/80 uppercase tracking-widest">{user?.role}</p>
                <p className="text-sm font-bold truncate">{user?.name}</p>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
                {visibleItems.map(({ name, icon: Icon }) => (
                    <a
                        key={name}
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleItemClick(name); }}
                        className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ease-in-out group ${
                            activeSection === name
                                ? 'bg-white/20 font-semibold'
                                : 'hover:bg-white/10'
                        }`}
                    >
                        <Icon className="w-6 h-6 mr-3 transition-transform duration-300 group-hover:scale-110" />
                        <span className="font-medium">{name}</span>
                    </a>
                ))}
            </nav>
            <div className="px-4 py-4 border-t border-white/20">
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); logout(); }}
                    className="flex items-center px-4 py-3 rounded-lg transition-all duration-200 ease-in-out group text-red-200 hover:bg-red-500/50"
                >
                    <LogoutIcon className="w-6 h-6 mr-3 transition-transform duration-300 group-hover:scale-110" />
                    <span className="font-medium">Logout</span>
                </a>
            </div>
        </aside>
        {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-30 lg:hidden"></div>}
    </>
  );
};

export default Sidebar;
