
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
    <div className="flex flex-col flex-1 h-screen dynamic-bg overflow-hidden">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {children}
      </main>
      
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--nav-bg)] backdrop-blur-2xl border-t border-[var(--border-glass)] pb-6 pt-3 px-4 flex justify-between items-center safe-area-bottom z-50">
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
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-cyan-500' : 'text-zinc-600 hover:text-zinc-400'}`}
  >
    <div className={`${active ? 'drop-shadow-[0_0_5px_rgba(6,182,212,0.4)]' : ''}`}>
      {icon}
    </div>
    <span className="text-[6px] font-black uppercase tracking-widest">{label}</span>
  </button>
);
