import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { createTopologySlice, TopologySlice, getSessionKey } from './slices/createTopologySlice';
import { createUiSlice, UiSlice } from './slices/createUiSlice';
import { createCliSlice, CliSlice } from './slices/createCliSlice';
import { createLabsSlice, LabsSlice } from './slices/createLabsSlice';
// Removed: Gamification, AI, Coach, Settings, Chaos

export interface NetworkState extends TopologySlice, UiSlice, CliSlice, LabsSlice { }

export const useNetworkStore = create<NetworkState>()((set, get, api) => ({
  ...createTopologySlice(set, get, api),
  ...createUiSlice(set, get, api),
  ...createCliSlice(set, get, api),
  ...createLabsSlice(set, get, api),
}));

// Simple Persistence for Topology
let saveTimeout: ReturnType<typeof setTimeout>;

useNetworkStore.subscribe((state, prev) => {
  if (state.devices !== prev.devices || state.cables !== prev.cables) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      const { activeUser, mode } = useAuthStore.getState();
      if (!activeUser || mode === 'demo') return;
      try {
        localStorage.setItem(getSessionKey(activeUser.id), JSON.stringify({ devices: state.devices, cables: state.cables }));
      } catch { }
    }, 1000);
  }
});
