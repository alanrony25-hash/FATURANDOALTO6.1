
import React from 'react';
import { AppState } from '../types';
import { LayoutDashboard, History, Wrench, Settings, BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showNav: boolean;
  currentPage: AppState;
  setCurrentPage: (state: AppState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, showNav, currentPage, setCurrentPage }) => {
  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden relative">
      <main className={`flex-1 overflow-y-auto no-scrollbar ${showNav ? 'pb-32' : ''}`}>
        {children}
      </main>
      
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--nav-bg)] border-t border-[var(--border-ui)] pb-8 pt-4 px-6 flex justify-between items-center z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
          <NavItem 
            active={currentPage === AppState.DASHBOARD} 
            icon={<LayoutDashboard size={20} />} 
            label="HUD" 
            onClick={() => setCurrentPage(AppState.DASHBOARD)}
          />
          <NavItem 
            active={currentPage === AppState.FINANCE_INSIGHTS} 
            icon={<BarChart3 size={20} />} 
            label="STATS" 
            onClick={() => setCurrentPage(AppState.FINANCE_INSIGHTS)}
          />
          <NavItem 
            active={currentPage === AppState.HISTORY} 
            icon={<History size={20} />} 
            label="LOGS" 
            onClick={() => setCurrentPage(AppState.HISTORY)}
          />
          <NavItem 
            active={currentPage === AppState.MAINTENANCE} 
            icon={<Wrench size={20} />} 
            label="BIKE" 
            onClick={() => setCurrentPage(AppState.MAINTENANCE)}
          />
          <NavItem 
            active={currentPage === AppState.SETTINGS} 
            icon={<Settings size={20} />} 
            label="CORE" 
            onClick={() => setCurrentPage(AppState.SETTINGS)}
          />
        </nav>
      )}
    </div>
  );
};

const NavItem = ({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${active ? 'nav-active' : 'text-[var(--text-secondary)] opacity-50'}`}
  >
    <div>{icon}</div>
    <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
  </button>
);
