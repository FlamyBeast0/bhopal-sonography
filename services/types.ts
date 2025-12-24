
export enum PaymentMode {
  Cash = 'Cash',
  Card = 'Card',
  Check = 'Check',
  Online = 'Online',
}

export enum PatientType {
  Direct = 'Direct',
  Referral = 'Referral',
  Credit = 'Credit',
}

export enum ReferralStatus {
  Pending = 'Pending',
  Partial = 'Partial',
  Paid = 'Paid',
}

export enum ExpenseCategory {
  Refreshments = 'Refreshments',
  OfficeSupplies = 'Office Supplies',
  Maintenance = 'Maintenance',
  Miscellaneous = 'Miscellaneous',
}

export enum QueueStatus {
  Waiting = 'Waiting',
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export enum UserRole {
  Admin = 'admin',
  Employee = 'employee',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Patient {
  id: string;
  date: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  doctorRef: string;
  testId: string;
  mrp: number;
  amountReceived: number;
  paymentMode: PaymentMode;
  remarks: string;
  receivedBy: string;
  patientType: PatientType;
  pro: string; // PRO / Care of
  referralAmount: number;
  referralStatus: ReferralStatus;
  paidDate?: string;
  paidTo?: string;
  tokenNumber: number;
  queueStatus: QueueStatus;
}

export type NewPatientData = Omit<Patient, 'id' | 'tokenNumber' | 'queueStatus'>;

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  paidTo: string;
}

export interface RateCardItem {
  id: string;
  studyName: string;
  mrp: number;
  landingPrice: number;
}

export type Theme = 
  | 'purple-blue' 
  | 'pink-purple' 
  | 'teal-green' 
  | 'orange-red' 
  | 'indigo-blue' 
  | 'green-emerald'
  | 'midnight-neon'
  | 'sunset-drive'
  | 'oceanic-depths'
  | 'forest-rain'
  | 'royal-gold'
  | 'berry-smoothie'
  | 'cyber-punk'
  | 'dracula-red'
  | 'coffee-bean';

export interface Settings {
  theme: Theme;
  darkMode: boolean;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
