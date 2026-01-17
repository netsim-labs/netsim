import { create } from 'zustand';
// import { supabaseClient } from '../lib/supabase.js';
import { DeviceModelMeta, defaultDeviceCatalog } from '../data/deviceCatalog';
import { applyDevicePacks } from '../plugins/devicePacks';

export interface DeviceCatalogState {
  models: DeviceModelMeta[];
  loadCatalog: () => Promise<void>;
}

const STORAGE_KEY = 'netsim-device-catalog';

export const useDeviceCatalogStore = create<DeviceCatalogState>((set) => ({
  models: applyDevicePacks(defaultDeviceCatalog),
  loadCatalog: async () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DeviceModelMeta[];
        if (parsed.length) {
          set({ models: applyDevicePacks(parsed) });
        }
      }
    } catch {
      //
    }

    // Cloud Sync disabled for Community Edition
  }
}));
