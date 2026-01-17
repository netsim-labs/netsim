import { StateCreator } from 'zustand';
import { PacketTrace } from '../../types/NetworkTypes';

// Interface for State and Actions
export interface UiSlice {
  activeConsoleId: string | null;
  openConsoleIds: string[];
  activeTrafficParams: string[];
  activeGuide: any | null;
  guideStepsDone: number[];
  packetTrace: PacketTrace | null;
  viewMode: 'logical' | 'physical';
  showLabsPanel: boolean;
  showAutomationPanel: boolean;
  systemLogs: any[];

  openConsole: (id: string | null) => void;
  closeConsole: (id: string) => void;
  markGuideStep: (idx: number, done: boolean) => void;
  clearGuide: () => void;
  setPacketTrace: (trace: PacketTrace | null) => void;
  setViewMode: (mode: 'logical' | 'physical') => void;
  setShowLabsPanel: (show: boolean) => void;
  setShowAutomationPanel: (show: boolean) => void;
  addLog: (log: any) => void;
  showGamificationDashboard: boolean;
  setShowGamificationDashboard: (show: boolean) => void;
  showExamSimulator: boolean;
  setShowExamSimulator: (show: boolean) => void;
  showSelfHealingConsole: boolean;
  setShowSelfHealingConsole: (show: boolean) => void;
  show3DView: boolean;
  setShow3DView: (show: boolean) => void;
}

export const createUiSlice: StateCreator<any, [], [], UiSlice> = (set) => ({
  activeConsoleId: null,
  openConsoleIds: [],
  activeTrafficParams: [],
  activeGuide: null,
  guideStepsDone: [],
  packetTrace: null,
  viewMode: 'logical',
  showLabsPanel: false,
  showAutomationPanel: false,
  showGamificationDashboard: false,
  showExamSimulator: false,
  showSelfHealingConsole: false,
  show3DView: false,
  systemLogs: [],

  openConsole: (id) => set((s: any) => {
    if (!id) return { activeConsoleId: null };
    const nextIds = s.openConsoleIds.includes(id) ? s.openConsoleIds : [...s.openConsoleIds, id];
    return { activeConsoleId: id, openConsoleIds: nextIds };
  }),
  closeConsole: (id) => set((s: any) => {
    const nextIds = s.openConsoleIds.filter((cid: string) => cid !== id);
    let nextActive = s.activeConsoleId;
    if (s.activeConsoleId === id) {
      nextActive = nextIds.length > 0 ? nextIds[nextIds.length - 1] : null;
    }
    return { activeConsoleId: nextActive, openConsoleIds: nextIds };
  }),
  markGuideStep: (idx, done) => set((s: any) => {
    if (s.activeGuide === null) return s;
    const setDone = new Set<number>(s.guideStepsDone);
    if (done) setDone.add(idx); else setDone.delete(idx);
    return { guideStepsDone: Array.from(setDone).sort((a, b) => a - b) };
  }),
  clearGuide: () => set({ activeGuide: null, guideStepsDone: [] }),
  setPacketTrace: (trace) => set({ packetTrace: trace }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setShowLabsPanel: (show) => set({ showLabsPanel: show }),
  setShowAutomationPanel: (show) => set({ showAutomationPanel: show }),
  addLog: (log) => set((state: any) => ({ systemLogs: [log, ...(state.systemLogs || [])] })),

  setShowGamificationDashboard: (show) => set({ showGamificationDashboard: show }),

  setShowExamSimulator: (show) => set({ showExamSimulator: show }),

  setShowSelfHealingConsole: (show) => set({ showSelfHealingConsole: show }),

  setShow3DView: (show) => set({ show3DView: show })
});
