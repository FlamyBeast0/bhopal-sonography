
import { Patient, RateCardItem, Settings, Expense } from './types';

export const APP_STATE_KEY = 'bhopalSonographyCenterState';

interface AppState {
  patients: Patient[];
  rateCard: RateCardItem[];
  settings: Settings;
  expenses: Expense[];
}

export const saveState = (state: AppState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(APP_STATE_KEY, serializedState);
  } catch (error) {
    console.error("Could not save state to localStorage", error);
  }
};

export const loadState = (): AppState | undefined => {
  try {
    const serializedState = localStorage.getItem(APP_STATE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Could not load state from localStorage", error);
    return undefined;
  }
};

const downloadJSON = (data: object, filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const downloadBackup = (state: AppState) => {
    const date = new Date().toISOString().split('T')[0];
    downloadJSON(state, `bhopal-sonography-backup-${date}.json`);
};

export const handleDailyBackup = (state: AppState) => {
  const today = new Date().toISOString().split('T')[0];
  const lastBackupDate = localStorage.getItem('lastBackupDate');
  if (lastBackupDate !== today) {
    downloadBackup(state);
    localStorage.setItem('lastBackupDate', today);
  }
};
