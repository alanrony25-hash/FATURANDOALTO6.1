
export enum AppState {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD',
  ACTIVE_JOURNEY = 'ACTIVE_JOURNEY',
  HISTORY = 'HISTORY',
  MAINTENANCE = 'MAINTENANCE',
  SETTINGS = 'SETTINGS',
  DAY_DETAIL = 'DAY_DETAIL',
  FINANCE_INSIGHTS = 'FINANCE_INSIGHTS'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface Ride {
  id: string;
  platform: 'Uber' | '99' | 'InDrive' | 'Particular';
  value: number;
  timestamp: number;
  location?: string;
}

export type ExpenseType = 
  | 'Fuel' 
  | 'Food' 
  | 'Maintenance' 
  | 'Cleaning' 
  | 'Parking' 
  | 'Toll' 
  | 'Internet' 
  | 'Insurance' 
  | 'Rent' 
  | 'PIX_Transfer'
  | 'Credit_Card'
  | 'House_Bill'
  | 'Other';

export interface Expense {
  id: string;
  type: ExpenseType;
  value: number;
  timestamp: number;
}

export interface BudgetBucket {
  id: string;
  label: string;
  percentage: number;
  currentAmount: number;
  goalAmount: number;
}

export interface MaintenanceItem {
  id: string;
  title: string;
  lastKm: number;
  nextKm: number;
  priority: 'high' | 'medium' | 'low';
}

export interface Journey {
  id: string;
  startTime: number;
  endTime?: number;
  startKm: number;
  endKm?: number;
  rides: Ride[];
  expenses: Expense[];
  status: 'active' | 'completed';
  isPaused?: boolean;
  totalPausedTime?: number;
  lastPauseTimestamp?: number;
}

export interface DashboardConfig {
  cockpitTitle: string;
  monthlyGoalLabel: string;
  todayNetLabel: string;
  todayExpensesLabel: string;
  shiftTimerLabel: string;
  bucketsSectionLabel: string;
  missionAdvisoryLabel: string;
  customMissionText?: string;
  costPerKm?: number; 
}

export interface PredictiveMetrics {
  estimatedFinishTime: string;
  earningRatePerHour: number;
  efficiencyGrade: 'A' | 'B' | 'C' | 'D';
}
