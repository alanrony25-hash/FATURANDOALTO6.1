
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, Journey, Ride, Expense, User, BudgetBucket, MaintenanceItem, DashboardConfig } from './types';
import Splash from './components/Splash';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ActiveJourney from './components/ActiveJourney';
import History from './components/History';
import Maintenance from './components/Maintenance';
import Settings from './components/Settings';
import DayDetail from './components/DayDetail';
import FinancialInsights from './components/FinancialInsights';
import PopUpWindow from './components/PopUpWindow';
import InstallOverlay from './components/InstallOverlay';
import VoiceCopilot from './components/VoiceCopilot';
import RadarPro from './components/RadarPro';
import { Layout } from './components/Layout';

const DEFAULT_BUCKETS: BudgetBucket[] = [
  { id: '1', label: 'Parcela Carro', percentage: 25, currentAmount: 0, goalAmount: 2800 },
  { id: '2', label: 'Cartões', percentage: 20, currentAmount: 0, goalAmount: 2240 },
  { id: '3', label: 'Gastos Casa', percentage: 25, currentAmount: 0, goalAmount: 2800 },
  { id: '4', label: 'Reserva/Poupança', percentage: 30, currentAmount: 0, goalAmount: 3360 },
];

const DEFAULT_MAINTENANCE: MaintenanceItem[] = [
  { id: 'm1', title: 'Troca de Óleo', lastKm: 45000, nextKm: 55000, priority: 'high' },
  { id: 'm2', title: 'Pastilhas Freio', lastKm: 40000, nextKm: 60000, priority: 'medium' },
  { id: 'm3', title: 'Kit Pneus', lastKm: 30000, nextKm: 80000, priority: 'low' },
];

const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  cockpitTitle: 'faturandoaltor15.0',
  monthlyGoalLabel: 'META MÊS',
  todayNetLabel: 'LUCRO HOJE',
  todayExpensesLabel: 'DEDUÇÕES',
  shiftTimerLabel: 'TEMPO LOGADO',
  bucketsSectionLabel: 'RESERVAS',
  missionAdvisoryLabel: 'DIRETRIZ',
  costPerKm: 0.45
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppState>(AppState.SPLASH);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [history, setHistory] = useState<Journey[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(11200);
  const [buckets, setBuckets] = useState<BudgetBucket[]>(DEFAULT_BUCKETS);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(DEFAULT_MAINTENANCE);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(DEFAULT_DASHBOARD_CONFIG);
  const [currentKm, setCurrentKm] = useState<number>(45750);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('app_theme') as 'dark' | 'light') || 'dark');
  const [isPopUpMode, setIsPopUpMode] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showRadar, setShowRadar] = useState(false);

  useEffect(() => {
    if (currentPage !== AppState.SPLASH && currentPage !== AppState.LOGIN && currentPage !== AppState.REGISTER) {
      localStorage.setItem('last_active_page', currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    const body = document.getElementById('app-body');
    if (body) {
      if (theme === 'light') body.classList.add('light-mode');
      else body.classList.remove('light-mode');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedUser = localStorage.getItem('logged_user');
    const savedActiveJourney = localStorage.getItem('active_journey_v13');
    const lastPage = localStorage.getItem('last_active_page') as AppState;
    const savedHistory = localStorage.getItem('driver_history');
    const savedMaint = localStorage.getItem('maintenance_logs');
    const savedKm = localStorage.getItem('current_odometer');
    
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedActiveJourney) setActiveJourney(JSON.parse(savedActiveJourney));
    if (savedMaint) {
        setMaintenanceItems(JSON.parse(savedMaint));
    } else {
        setMaintenanceItems(DEFAULT_MAINTENANCE); // Fallback se vazio
    }
    if (savedKm) setCurrentKm(Number(savedKm));
    
    const bucketsSaved = localStorage.getItem('budget_buckets');
    if (bucketsSaved) setBuckets(JSON.parse(bucketsSaved));

    setTimeout(() => {
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        if (savedActiveJourney) {
          setCurrentPage(AppState.ACTIVE_JOURNEY);
        } else if (lastPage && lastPage !== AppState.SPLASH) {
          setCurrentPage(lastPage);
        } else {
          setCurrentPage(AppState.DASHBOARD);
        }
      } else {
        setCurrentPage(AppState.LOGIN);
      }
    }, 2000);
  }, []);

  const handleUpdateKm = (newKm: number) => {
    setCurrentKm(newKm);
    localStorage.setItem('current_odometer', newKm.toString());
  };

  const startJourney = useCallback((km: number) => {
    const newJourney: Journey = { id: Date.now().toString(), startTime: Date.now(), startKm: km, rides: [], expenses: [], status: 'active', isPaused: false, totalPausedTime: 0 };
    setActiveJourney(newJourney);
    handleUpdateKm(km);
    localStorage.setItem('active_journey_v13', JSON.stringify(newJourney));
    setCurrentPage(AppState.ACTIVE_JOURNEY);
  }, []);

  const endJourney = useCallback((finalKm: number, platformGross: Record<string, number>, finalExpenses: Expense[]) => {
    if (!activeJourney) return;
    const rides: Ride[] = Object.entries(platformGross).filter(([_, v]) => v > 0).map(([platform, value]) => ({ id: `${Date.now()}-${platform}`, platform: platform as any, value: value, timestamp: Date.now() }));
    const totalGross = rides.reduce((acc, r) => acc + r.value, 0);
    const completedJourney: Journey = { ...activeJourney, endTime: Date.now(), endKm: finalKm, status: 'completed', rides, expenses: finalExpenses };
    const kmTravelled = Math.max(0, finalKm - activeJourney.startKm);
    const net = totalGross - finalExpenses.reduce((a, e) => a + e.value, 0) - (kmTravelled * (dashboardConfig.costPerKm || 0.45));
    
    handleUpdateKm(finalKm);

    if (net > 0) {
      const newBuckets = buckets.map(b => ({ ...b, currentAmount: b.currentAmount + (net * (b.percentage / 100)) }));
      setBuckets(newBuckets);
      localStorage.setItem('budget_buckets', JSON.stringify(newBuckets));
    }
    setHistory(prev => {
        const newHistory = [completedJourney, ...prev];
        localStorage.setItem('driver_history', JSON.stringify(newHistory));
        return newHistory;
    }); 
    setActiveJourney(null);
    localStorage.removeItem('active_journey_v13');
    setCurrentPage(AppState.DAY_DETAIL);
  }, [activeJourney, buckets, dashboardConfig.costPerKm]);

  return (
    <div className="max-w-md mx-auto min-h-screen dynamic-bg relative overflow-hidden flex flex-col shadow-2xl border-x border-white/5">
      <Layout showNav={![AppState.SPLASH, AppState.LOGIN, AppState.REGISTER, AppState.ACTIVE_JOURNEY].includes(currentPage)} currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {currentPage === AppState.SPLASH && <Splash />}
        {currentPage === AppState.LOGIN && <Login onLogin={(u, r) => { setCurrentUser(u); if(r) localStorage.setItem('logged_user', JSON.stringify(u)); setCurrentPage(AppState.DASHBOARD); }} onGoToRegister={() => setCurrentPage(AppState.REGISTER)} />}
        {currentPage === AppState.REGISTER && <Register onRegister={(u) => { setCurrentUser(u); localStorage.setItem('logged_user', JSON.stringify(u)); setCurrentPage(AppState.DASHBOARD); }} onBack={() => setCurrentPage(AppState.LOGIN)} />}
        {currentPage === AppState.DASHBOARD && <Dashboard 
          history={history} monthlyGoal={monthlyGoal} onUpdateGoal={setMonthlyGoal} buckets={buckets} 
          onUpdateBuckets={(b) => { setBuckets(b); localStorage.setItem('budget_buckets', JSON.stringify(b)); }}
          onResetBuckets={() => { const nb = buckets.map(b => ({...b, currentAmount: 0})); setBuckets(nb); localStorage.setItem('budget_buckets', JSON.stringify(nb)); }}
          onResetSingleBucket={(id) => { const nb = buckets.map(b => b.id === id ? {...b, currentAmount: 0} : b); setBuckets(nb); localStorage.setItem('budget_buckets', JSON.stringify(nb)); }}
          onStartJourney={startJourney} activeJourney={activeJourney} onViewHistory={() => setCurrentPage(AppState.HISTORY)} currentKm={currentKm}
          onStartVoice={() => setShowVoice(true)} onOpenRadar={() => setShowRadar(true)}
          dashboardConfig={dashboardConfig} onUpdateDashboardConfig={(c) => setDashboardConfig(c)}
          onGoToSettings={() => setCurrentPage(AppState.SETTINGS)}
        />}
        {currentPage === AppState.ACTIVE_JOURNEY && activeJourney && (
          <ActiveJourney journey={activeJourney} onEndJourney={endJourney} dailyGoal={monthlyGoal/25} onMinimize={() => setIsPopUpMode(true)} />
        )}
        {currentPage === AppState.HISTORY && <History history={history} onDeleteJourney={(id) => setHistory(h => h.filter(j => j.id !== id))} onBack={() => setCurrentPage(AppState.DASHBOARD)} />}
        {currentPage === AppState.MAINTENANCE && <Maintenance currentKm={currentKm} items={maintenanceItems} onUpdateItems={(it) => { setMaintenanceItems(it); localStorage.setItem('maintenance_logs', JSON.stringify(it)); }} onBack={() => setCurrentPage(AppState.DASHBOARD)} />}
        {currentPage === AppState.SETTINGS && <Settings dailyGoal={monthlyGoal} setDailyGoal={setMonthlyGoal} buckets={buckets} setBuckets={setBuckets} onBack={() => setCurrentPage(AppState.DASHBOARD)} onLogout={() => { localStorage.removeItem('logged_user'); setCurrentUser(null); setCurrentPage(AppState.LOGIN); }} theme={theme} onToggleTheme={() => setTheme(p => p === 'dark' ? 'light' : 'dark')} dashboardConfig={dashboardConfig} onUpdateDashboardConfig={setDashboardConfig} />}
        {currentPage === AppState.DAY_DETAIL && history[0] && <DayDetail journey={history[0]} onBack={() => setCurrentPage(AppState.DASHBOARD)} />}
        {currentPage === AppState.FINANCE_INSIGHTS && <FinancialInsights history={history} monthlyGoal={monthlyGoal} onBack={() => setCurrentPage(AppState.DASHBOARD)} />}
      </Layout>
      {showVoice && <VoiceCopilot onClose={() => setShowVoice(false)} history={history} />}
      {showRadar && <RadarPro onClose={() => setShowRadar(false)} />}
      <InstallOverlay />
    </div>
  );
};

export default App;
