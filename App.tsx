
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

const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  cockpitTitle: 'CYBER-COMMAND 13.5',
  monthlyGoalLabel: 'META MÊS',
  todayNetLabel: 'LUCRO HOJE',
  todayExpensesLabel: 'DEDUÇÕES',
  shiftTimerLabel: 'TEMPO LOGADO',
  bucketsSectionLabel: 'RESERVAS DE CAIXA',
  missionAdvisoryLabel: 'DIRETRIZ DE VOO',
  costPerKm: 0.45
};

const DEFAULT_MAINTENANCE: MaintenanceItem[] = [
  { id: '1', title: 'Troca de Óleo', lastKm: 40000, nextKm: 50000, priority: 'high' },
  { id: '2', title: 'Pastilhas Freio', lastKm: 35000, nextKm: 55000, priority: 'medium' },
  { id: '3', title: 'Rodízio Pneus', lastKm: 42000, nextKm: 52000, priority: 'low' },
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppState>(AppState.SPLASH);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [history, setHistory] = useState<Journey[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(11200);
  const [buckets, setBuckets] = useState<BudgetBucket[]>(DEFAULT_BUCKETS);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(DEFAULT_DASHBOARD_CONFIG);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(DEFAULT_MAINTENANCE);
  const [currentKm, setCurrentKm] = useState<number>(45200);
  const [isPopUpMode, setIsPopUpMode] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('app_theme') as 'dark' | 'light') || 'dark');

  useEffect(() => {
    const body = document.getElementById('app-body');
    if (body) {
      if (theme === 'light') body.classList.add('light-mode');
      else body.classList.remove('light-mode');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('monthly_goal', monthlyGoal.toString());
  }, [monthlyGoal]);

  useEffect(() => {
    if (activeJourney) localStorage.setItem('active_journey_v13', JSON.stringify(activeJourney));
    else localStorage.removeItem('active_journey_v13');
  }, [activeJourney]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('driver_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    const savedGoal = localStorage.getItem('monthly_goal');
    if (savedGoal) setMonthlyGoal(Number(savedGoal));
    const savedBuckets = localStorage.getItem('budget_buckets');
    if (savedBuckets) setBuckets(JSON.parse(savedBuckets));
    const savedConfig = localStorage.getItem('dashboard_config');
    if (savedConfig) setDashboardConfig(JSON.parse(savedConfig));
    const savedMaintenance = localStorage.getItem('maintenance_items');
    if (savedMaintenance) setMaintenanceItems(JSON.parse(savedMaintenance));
    const savedKm = localStorage.getItem('current_km');
    if (savedKm) setCurrentKm(Number(savedKm));
    const savedActiveJourney = localStorage.getItem('active_journey_v13');
    if (savedActiveJourney) setActiveJourney(JSON.parse(savedActiveJourney));

    const savedUser = localStorage.getItem('logged_user');
    const rememberMe = localStorage.getItem('remember_me') === 'true';
    
    setTimeout(() => {
      if (savedUser && rememberMe) { 
        setCurrentUser(JSON.parse(savedUser)); 
        setCurrentPage(savedActiveJourney ? AppState.ACTIVE_JOURNEY : AppState.DASHBOARD);
      } else { 
        setCurrentPage(AppState.LOGIN); 
      }
    }, 2500);
  }, []);

  const updateDashboardConfig = (config: DashboardConfig) => {
    setDashboardConfig(config);
    localStorage.setItem('dashboard_config', JSON.stringify(config));
  };

  const startJourney = useCallback((km: number) => {
    const newJourney: Journey = { id: Date.now().toString(), startTime: Date.now(), startKm: km, rides: [], expenses: [], status: 'active', isPaused: false, totalPausedTime: 0 };
    setCurrentKm(km); 
    setActiveJourney(newJourney); 
    setCurrentPage(AppState.ACTIVE_JOURNEY);
  }, []);

  const endJourney = useCallback((finalKm: number, platformGross: Record<string, number>, finalExpenses: Expense[]) => {
    if (!activeJourney) return;
    
    const rides: Ride[] = Object.entries(platformGross)
      .filter(([_, value]) => value > 0)
      .map(([platform, value]) => ({
        id: `${Date.now()}-${platform}`,
        platform: platform as any,
        value: value,
        timestamp: Date.now()
      }));

    const totalGross = rides.reduce((acc, r) => acc + r.value, 0);

    const completedJourney: Journey = { 
      ...activeJourney, 
      endTime: Date.now(), 
      endKm: finalKm, 
      status: 'completed',
      rides: rides,
      expenses: finalExpenses
    };

    const kmTravelled = Math.max(0, finalKm - activeJourney.startKm);
    const depreciation = kmTravelled * (dashboardConfig.costPerKm || 0.45);
    const expensesTotal = finalExpenses.reduce((a, e) => a + e.value, 0);
    const net = totalGross - expensesTotal - depreciation;
    
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
    setIsPopUpMode(false);
    setCurrentKm(finalKm);
    localStorage.setItem('current_km', finalKm.toString());
    setCurrentPage(AppState.DAY_DETAIL);
  }, [activeJourney, buckets, dashboardConfig.costPerKm]);

  const togglePauseFromPopUp = () => {
    if (activeJourney) {
      setActiveJourney({ ...activeJourney, isPaused: !activeJourney.isPaused });
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen dynamic-bg relative overflow-hidden flex flex-col shadow-2xl">
      <Layout showNav={![AppState.SPLASH, AppState.LOGIN, AppState.REGISTER, AppState.ACTIVE_JOURNEY].includes(currentPage) || isPopUpMode} currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {currentPage === AppState.SPLASH && <Splash />}
        {currentPage === AppState.LOGIN && <Login onLogin={(u, r) => { setCurrentUser(u); localStorage.setItem('remember_me', r.toString()); if(r) localStorage.setItem('logged_user', JSON.stringify(u)); setCurrentPage(AppState.DASHBOARD); }} onGoToRegister={() => setCurrentPage(AppState.REGISTER)} />}
        {currentPage === AppState.REGISTER && <Register onRegister={(u) => { setCurrentUser(u); setCurrentPage(AppState.DASHBOARD); }} onBack={() => setCurrentPage(AppState.LOGIN)} />}
        {currentPage === AppState.DASHBOARD && <Dashboard 
          history={history} monthlyGoal={monthlyGoal} onUpdateGoal={setMonthlyGoal} buckets={buckets} onUpdateBuckets={setBuckets}
          onResetBuckets={() => setBuckets(p => p.map(b => ({...b, currentAmount: 0})))} onResetSingleBucket={(id) => setBuckets(p => p.map(b => b.id === id ? {...b, currentAmount: 0} : b))}
          onStartJourney={startJourney} activeJourney={activeJourney} onViewHistory={() => setCurrentPage(AppState.HISTORY)} currentKm={currentKm}
          onStartVoice={() => setShowVoice(true)} onOpenRadar={() => setShowRadar(true)}
          dashboardConfig={dashboardConfig} onUpdateDashboardConfig={updateDashboardConfig}
        />}
        {currentPage === AppState.ACTIVE_JOURNEY && activeJourney && (
          <ActiveJourney 
            journey={activeJourney} 
            onEndJourney={endJourney} 
            dailyGoal={monthlyGoal/25} 
            onMinimize={() => setIsPopUpMode(true)} 
          />
        )}
        {currentPage === AppState.HISTORY && <History history={history} onDeleteJourney={(id) => setHistory(h => h.filter(j => j.id !== id))} onBack={() => setCurrentPage(AppState.DASHBOARD)} />}
        {currentPage === AppState.MAINTENANCE && <Maintenance currentKm={currentKm} items={maintenanceItems} onUpdateItems={setMaintenanceItems} onBack={() => setCurrentPage(AppState.DASHBOARD)} />}
        {currentPage === AppState.SETTINGS && <Settings dailyGoal={monthlyGoal} setDailyGoal={setMonthlyGoal} buckets={buckets} setBuckets={setBuckets} onBack={() => setCurrentPage(AppState.DASHBOARD)} onLogout={() => { setCurrentUser(null); setCurrentPage(AppState.LOGIN); }} theme={theme} onToggleTheme={() => setTheme(p => p === 'dark' ? 'light' : 'dark')} dashboardConfig={dashboardConfig} onUpdateDashboardConfig={updateDashboardConfig} />}
        {currentPage === AppState.DAY_DETAIL && history[0] && <DayDetail journey={history[0]} onBack={() => setCurrentPage(AppState.DASHBOARD)} />}
        {currentPage === AppState.FINANCE_INSIGHTS && <FinancialInsights history={history} monthlyGoal={monthlyGoal} onBack={() => setCurrentPage(AppState.DASHBOARD)} />}
      </Layout>
      {showVoice && <VoiceCopilot onClose={() => setShowVoice(false)} history={history} />}
      {showRadar && <RadarPro onClose={() => setShowRadar(false)} />}
      
      {/* POPUP MODE WINDOW */}
      {activeJourney && isPopUpMode && (
        <PopUpWindow 
          journey={activeJourney} 
          onExpand={() => setIsPopUpMode(false)}
          isPaused={!!activeJourney.isPaused}
          onTogglePause={togglePauseFromPopUp}
          onQuickExpense={() => { setIsPopUpMode(false); }} // Ao clicar em gasto, volta para tela cheia para lançar
        />
      )}

      <InstallOverlay />
    </div>
  );
};

export default App;
