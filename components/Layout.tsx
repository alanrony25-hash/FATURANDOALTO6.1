
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
      <main className={`flex-1 overflow-y-auto no-scrollbar ${showNav ? 'pb-24' : ''}`}>
        {children}
      </main>
      
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-primary)] border-t border-[var(--border-ui)] pb-6 pt-3 px-4 flex justify-between items-center z-[100] backdrop-blur-xl">
          <NavItem 
            active={currentPage === AppState.DASHBOARD} 
            icon={<LayoutDashboard size={18} />} 
            label="HUD" 
            onClick={() => setCurrentPage(AppState.DASHBOARD)}
          />
          <NavItem 
            active={currentPage === AppState.FINANCE_INSIGHTS} 
            icon={<BarChart3 size={18} />} 
            label="STATS" 
            onClick={() => setCurrentPage(AppState.FINANCE_INSIGHTS)}
          />
          <NavItem 
            active={currentPage === AppState.HISTORY} 
            icon={<History size={18} />} 
            label="LOGS" 
            onClick={() => setCurrentPage(AppState.HISTORY)}
          />
          <NavItem 
            active={currentPage === AppState.MAINTENANCE} 
            icon={<Wrench size={18} />} 
            label="MANUT" 
            onClick={() => setCurrentPage(AppState.MAINTENANCE)}
          />
          <NavItem 
            active={currentPage === AppState.SETTINGS} 
            icon={<Settings size={18} />} 
            label="SET" 
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
    className={`flex flex-col items-center gap-0.5 transition-all active:scale-90 ${active ? 'nav-active' : 'text-[var(--text-secondary)] opacity-40'}`}
  >
    <div className="mb-0.5">{icon}</div>
    <span className="text-[6px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);
