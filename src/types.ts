export type DeviceCategoryKey =
  | 'laptop_pc'
  | 'konsole'
  | 'controller'
  | 'schluessel'
  | 'phone'
  | 'daten';

export type CategoryType = 'display' | 'module' | 'board' | 'software';

export interface FaultItem {
  id: string;
  title: string;
  desc: string;
  categoryType: CategoryType;
  laborNet: number;
  partsNet: number;
  targetTotal: number;
  time: string;
  compare?: string;
  newDevicePrice?: number;
  express?: number;
  crossSell?: string;
  steps: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
  imagePreview?: string;
  isThinking?: boolean;
}

export interface RepairTicketData {
  ticketId: string;
  customerName: string;
  phone: string;
  device: string;
  fault: string;
  preDamages?: string;
  status: 'EINGANG' | 'MIKROSKOP_DIAGNOSE' | 'LOETEN_REBALLING' | 'STRESSTEST_4K' | 'ABHOLBEREIT';
  statusDetails: string;
  createdAt: string;
  estimatedCompletion: string;
  testedPassed: boolean;
}
