import { create } from 'zustand';

type FeatureFlags = {
  aiAssistant: boolean;
  betaUi: boolean;
  alarmsPanel: boolean;
};

type OpenAIConfig = {
  enabled: boolean;
  apiKey?: string;
  model?: string;
};

interface ConfigState {
  features: FeatureFlags;
  openai: OpenAIConfig;
  load: () => void;
}

const defaultState: ConfigState = {
  features: { aiAssistant: false, betaUi: false, alarmsPanel: true },
  openai: { enabled: false, model: 'gpt-4o-mini', apiKey: '' },
  load: () => {}
};

export const useConfigStore = create<ConfigState>((set) => ({
  ...defaultState,
  load: () => {
    try {
      const raw = localStorage.getItem('netsim-admin-config');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      set({
        features: parsed.features || defaultState.features,
        openai: parsed.openai || defaultState.openai
      });
    } catch {
      // ignore
    }
  }
}));
