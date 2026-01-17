import { StateCreator } from 'zustand';

export interface ChaosEvent {
    id: string;
    timestamp: string;
    type: 'link_down' | 'config_change' | 'device_reboot';
    description: string;
    targetId: string;
    reverted: boolean;
}

export interface ChaosSlice {
    chaosModeEnabled: boolean;
    chaosIntensity: 'low' | 'medium' | 'high'; // low=5min, medium=2min, high=30s
    activeFaults: ChaosEvent[];

    toggleChaosMode: (enabled: boolean) => void;
    setChaosIntensity: (level: 'low' | 'medium' | 'high') => void;
    addFault: (fault: ChaosEvent) => void;
    clearFaults: () => void; // Revert all?
}

export const createChaosSlice: StateCreator<any, [], [], ChaosSlice> = (set, _get) => ({
    chaosModeEnabled: false,
    chaosIntensity: 'medium',
    activeFaults: [],

    toggleChaosMode: (enabled) => set({ chaosModeEnabled: enabled }),
    setChaosIntensity: (level) => set({ chaosIntensity: level }),
    addFault: (fault) => set((state: ChaosSlice) => ({ activeFaults: [fault, ...state.activeFaults] })),
    clearFaults: () => set({ activeFaults: [] })
});
