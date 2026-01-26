
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, Journey, Ride, Expense, User, BudgetBucket, MaintenanceItem } from './types';
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
import FloatingWidget from './components/FloatingWidget';
import InstallOverlay from './components/InstallOverlay';
import { Layout } from './components/Layout';

const DEFAULT_BUCKETS: BudgetBucket[] = [
  { id: '1', label: 'Parcela Carro', percentage: 25, currentAmount: 0, goalAmount: 2800 },
  { id: '2', label: 'Cartões', percentage: 20, currentAmount: 0, goalAmount: 2240 },
  { id: '3', label: 'Gastos Casa', percentage: 25, currentAmount: 0, goalAmount: 2800 },
  { id: '4', label: 'Reserva/Poupança', percentage: 30, currentAmount: 0, goalAmount: 3360 },
];

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
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(DEFAULT_MAINTENANCE);
  const [currentKm, setCurrentKm] = useState<number>(45200);
  const [isWidgetMinimized, setIsWidgetMinimized] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('logged_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const savedHistory = localStorage.getItem('driver_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedGoal = localStorage.getItem('monthly_goal');
    if (savedGoal && Number(savedGoal) > 0) setMonthlyGoal(Number(savedGoal));

    const savedBuckets = localStorage.getItem('budget_buckets');
    if (savedBuckets) setBuckets(JSON.parse(savedBuckets));

    const savedMaintenance = localStorage.getItem('maintenance_items');
    if (savedMaintenance) setMaintenanceItems(JSON.parse(savedMaintenance));

    const savedKm = localStorage.getItem('current_km');
    if (savedKm) setCurrentKm(Number(savedKm));

    const timer = setTimeout(() => {
      if (savedUser) setCurrentPage(AppState.DASHBOARD);
      else setCurrentPage(AppState.LOGIN);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('driver_history', JSON.stringify(history));
    localStorage.setItem('monthly_goal', monthlyGoal.toString());
    localStorage.setItem('budget_buckets', JSON.stringify(buckets));
    localStorage.setItem('maintenance_items', JSON.stringify(maintenanceItems));
    localStorage.setItem('current_km', currentKm.toString());
    if (currentUser) localStorage.setItem('logged_user', JSON.stringify(currentUser));
  }, [history, monthlyGoal, buckets, maintenanceItems, currentUser, currentKm]);

  const startJourney = useCallback((km: number) => {
    const newJourney: Journey = {
      id: Date.now().toString(),
      startTime: Date.now(),
      startKm: km,
      rides: [],
      expenses: [],
      status: 'active'
    };
    setCurrentKm(km);
    setActiveJourney(newJourney);
    setCurrentPage(AppState.ACTIVE_JOURNEY);
  }, []);

  const endJourney = useCallback((finalKm: number) => {
    if (!activeJourney) return;
    const completedJourney: Journey = {
      ...activeJourney,
      endTime: Date.now(),
      endKm: finalKm,
      status: 'completed'
    };

    const gross = activeJourney.rides.reduce((acc, r) => acc + r.value, 0);
    const exp = activeJourney.expenses.reduce((acc, e) => acc + e.value, 0);
    const net = gross - exp;

    if (net > 0) {
      setBuckets(prev => prev.map(b => ({
        ...b,
        currentAmount: b.currentAmount + (net * (b.percentage / 100))
      })));
    }

    setHistory(prev => [completedJourney, ...prev]);
    setActiveJourney(null);
    setCurrentKm(finalKm);
    setCurrentPage(AppState.DAY_DETAIL);
  }, [activeJourney]);

  const handleResetBuckets = () => {
    if (confirm('Deseja ZERAR o acumulado de TODOS os baldes agora?')) {
      setBuckets(prev => prev.map(b => ({ ...b, currentAmount: 0 })));
    }
  };

  const handleResetSingleBucket = (id: string) => {
    setBuckets(prev => prev.map(b => b.id === id ? { ...b, currentAmount: 0 } : b));
  };

  const addRide = (ride: Ride) => setActiveJourney(p => {
    if (!p) return null;
    const existing = p.rides.find(r => r.platform === ride.platform);
    if (existing) {
      return { ...p, rides: p.rides.map(r => r.platform === ride.platform ? { ...r, value: ride.value } : r) };
    }
    return { ...p, rides: [...p.rides, ride] };
  });

  const updateRide = (id: string, val: number) => setActiveJourney(p => p ? ({ ...p, rides: p.rides.map(r => r.id === id ? { ...r, value: val } : r) }) : null);
  const deleteRide = (id: string) => setActiveJourney(p => p ? ({ ...p, rides: p.rides.filter(r => r.id !== id) }) : null);
  
  const addExpense = (exp: Expense) => setActiveJourney(p => p ? ({ ...p, expenses: [...p.expenses, exp] }) : null);
  const updateExpense = (id: string, val: number) => setActiveJourney(p => p ? ({ ...p, expenses: p.expenses.map(e => e.id === id ? { ...e, value: val } : e) }) : null);
  const deleteExpense = (id: string) => setActiveJourney(p => p ? ({ ...p, expenses: p.expenses.filter(e => e.id !== id) }) : null);

  const renderContent = () => {
    switch (currentPage) {
      case AppState.SPLASH: return <Splash />;
      case AppState.LOGIN: return <Login onLogin={(u) => { setCurrentUser(u); setCurrentPage(AppState.DASHBOARD); }} onGoToRegister={() => setCurrentPage(AppState.REGISTER)} />;
      case AppState.REGISTER: return <Register onRegister={(u) => { setCurrentUser(u); setCurrentPage(AppState.DASHBOARD); }} onBack={() => setCurrentPage(AppState.LOGIN)} />;
      case AppState.DASHBOARD:
        return <Dashboard 
          history={history} 
          monthlyGoal={monthlyGoal} 
          onUpdateGoal={setMonthlyGoal}
          buckets={buckets}
          onUpdateBuckets={setBuckets}
          onResetBuckets={handleResetBuckets}
          onResetSingleBucket={handleResetSingleBucket}
          onStartJourney={startJourney}
          activeJourney={activeJourney}
          onViewHistory={() => setCurrentPage(AppState.HISTORY)}
          currentKm={currentKm}
        />;
      case AppState.ACTIVE_JOURNEY:
        return activeJourney ? (
          <ActiveJourney 
            journey={activeJourney} 
            onEndJourney={endJourney} 
            onAddRide={addRide} onUpdateRide={updateRide} onDeleteRide={deleteRide}
            onAddExpense={addExpense} onUpdateExpense={updateExpense} onDeleteExpense={deleteExpense}
            dailyGoal={monthlyGoal / 30}
            onMinimize={() => { setIsWidgetMinimized(true); setCurrentPage(AppState.DASHBOARD); }}
          />
        ) : null;
      case AppState.HISTORY: return <History history={history} onDeleteJourney={(id) => setHistory(h => h.filter(j => j.id !== id))} onBack={() => setCurrentPage(AppState.DASHBOARD)} />;
      case AppState.MAINTENANCE: return <Maintenance currentKm={currentKm} items={maintenanceItems} onUpdateItems={setMaintenanceItems} onBack={() => setCurrentPage(AppState.DASHBOARD)} />;
      case AppState.SETTINGS: return <Settings dailyGoal={monthlyGoal} setDailyGoal={setMonthlyGoal} buckets={buckets} setBuckets={setBuckets} onBack={() => setCurrentPage(AppState.DASHBOARD)} onLogout={() => { setCurrentUser(null); setCurrentPage(AppState.LOGIN); }} />;
      case AppState.DAY_DETAIL: return history[0] ? <DayDetail journey={history[0]} onBack={() => setCurrentPage(AppState.DASHBOARD)} /> : null;
      case AppState.FINANCE_INSIGHTS: return <FinancialInsights history={history} monthlyGoal={monthlyGoal} onBack={() => setCurrentPage(AppState.DASHBOARD)} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black relative overflow-hidden flex flex-col shadow-2xl">
      <Layout showNav={![AppState.SPLASH, AppState.LOGIN, AppState.REGISTER, AppState.ACTIVE_JOURNEY].includes(currentPage)} currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {renderContent()}
      </Layout>
      {activeJourney && isWidgetMinimized && currentPage !== AppState.ACTIVE_JOURNEY && (
        <FloatingWidget journey={activeJourney} onExpand={() => { setIsWidgetMinimized(false); setCurrentPage(AppState.ACTIVE_JOURNEY); }} />
      )}
      <InstallOverlay />
    </div>
  );
};

export default App;
