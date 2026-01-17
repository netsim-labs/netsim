import { StateCreator } from 'zustand';
import { NetworkDevice, NetworkCable, SwitchModel, NetworkPort, PortMode } from '../../types/NetworkTypes';
import { generateUUID } from '../../utils/common';
import { defaultDeviceCatalog } from '../../data/deviceCatalog';

export const getSessionKey = (userId: string) => `netsim-topology-${userId}`;

// Logic Stubs
export const recomputeOspf = (devices: any[], _cables: any[]) => ({ devices });
export const cleanDhcpLeases = (devices: any[]) => devices;

export interface TopologySlice {
  devices: NetworkDevice[];
  cables: NetworkCable[];
  pendingSfpModule: any;
  selectedPort: { deviceId: string; portId: string } | null;

  initialize: () => void;
  addDevice: (model: SwitchModel, position?: { x: number; y: number }) => NetworkDevice;
  removeDevice: (id: string) => void;
  addCable: (cable: NetworkCable) => void;
  removeCable: (id: string) => void;
  updateDevicePosition: (id: string, pos: { x: number; y: number }) => void;
  updateDevice: (id: string, updates: Partial<NetworkDevice>) => void;
  updatePortConfig: (deviceId: string, portId: string, config: any) => void;
  onPortClick: (deviceId: string, portId: string) => { success: boolean; message?: string };
  insertSfp: (deviceId: string, portId: string, model: string) => void;

  // Stubs for compatibility
  loadSession: (user: string, isDemo: boolean, altId?: string | null) => Promise<{ ok: boolean; source: 'local' }>;
  saveRemote: () => Promise<boolean>;
  selectSfpModule: (model: any) => void;

  // Stubs for deleted features
  collaborationLock: any;
  presenceEntries: any[];
  workspaceSecurity: any;

  setTopology: (devices: NetworkDevice[], cables: NetworkCable[]) => void;
}

export const createPort = (id: string, name: string, type: 'RJ45' | 'SFP', mode: PortMode): NetworkPort => ({
  id,
  name,
  type,
  status: 'down',
  config: {
    enabled: true,
    vlan: 1,
    mode,
  },
  sfpModule: type === 'SFP' ? null : undefined,
  connectedCableId: null,
  speed: type === 'SFP' ? 10000 : 1000
});

const generateMac = () => {
  const hex = '0123456789ABCDEF';
  let mac = '50:50:00'; // Fictitious local prefix
  for (let i = 0; i < 3; i++) {
    mac += ':' + hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)];
  }
  return mac;
};

const generatePorts = (model: string): NetworkPort[] => {
  const ports: NetworkPort[] = [];
  const entry = defaultDeviceCatalog.find(m => m.model === model);

  if (!entry) {
    // Fallback if model not in catalog
    const isSwitch = model.toLowerCase().includes('switch');
    const count = isSwitch ? 24 : 4;
    for (let i = 1; i <= count; i++) {
      ports.push(createPort(generateUUID(), `GE0/0/${i}`, 'RJ45', isSwitch ? 'access' : 'routed'));
    }
    return ports;
  }

  const geCount = entry.ports.ge || 0;
  const xgeCount = entry.ports.xge || 0;
  const isRouter = entry.category === 'Router';
  const isHost = entry.category === 'Host';
  const portMode: PortMode = (isRouter || isHost) ? 'routed' : 'access';

  for (let i = 1; i <= geCount; i++) {
    const name = isRouter ? `GE0/0/${i - 1}` : isHost ? `eth${i - 1}` : `GE0/0/${i}`;
    ports.push(createPort(generateUUID(), name, 'RJ45', portMode));
  }
  for (let i = 1; i <= xgeCount; i++) {
    ports.push(createPort(generateUUID(), `XGE0/0/${i}`, 'SFP', isRouter ? 'routed' : 'trunk'));
  }

  return ports;
};

export const deviceFactory = (model: SwitchModel | string, position: { x: number; y: number }): NetworkDevice => {
  const id = generateUUID();
  const entry = defaultDeviceCatalog.find(m => m.model === model);

  return {
    id,
    type: (model.includes('Router') ? 'Router' : model.includes('PC') ? 'PC' : 'Switch') as any,
    status: 'on',
    vendor: entry?.vendor || 'Huawei',
    hostname: `${model}-${id.slice(0, 4)}`,
    macAddress: generateMac(),
    model,
    position: {
      x: position?.x ?? 100,
      y: position?.y ?? 100
    },
    ports: generatePorts(model as string),
    vlans: [1],
    consoleLogs: ['System ready.'],
    cliState: { view: 'user-view' },
  } as any;
};

export const createTopologySlice: StateCreator<any, [], [], TopologySlice> = (set, get, api) => ({
  devices: [],
  cables: [],
  pendingSfpModule: null,
  selectedPort: null,
  collaborationLock: { owner: null, busy: false },
  presenceEntries: [],
  workspaceSecurity: { roles: {} },

  initialize: () => {
    // Load from local storage if available
    const saved = localStorage.getItem('netsim-topology');
    if (saved) {
      try {
        const { devices, cables } = JSON.parse(saved);
        // Migration: Ensure loaded nodes have MAC and ports if absent
        const migratedDevices = devices.map((d: any) => ({
          ...d,
          macAddress: d.macAddress || generateMac(),
          ports: (d.ports && d.ports.length > 0) ? d.ports : generatePorts(d.model)
        }));
        set({ devices: migratedDevices, cables });
      } catch (e) {
        console.error('Failed to load topology', e);
      }
    }
  },

  addDevice: (model: SwitchModel, position: { x: number; y: number } = { x: 100, y: 100 }) => {
    const newDev = deviceFactory(model, position);
    set((state: any) => ({ devices: [...state.devices, newDev] }));
    return newDev;
  },

  removeDevice: (id: string) => set((state: any) => ({ devices: state.devices.filter((d: any) => d.id !== id) })),

  addCable: (cable: NetworkCable) => set((state: any) => {
    const devices = state.devices.map((d: NetworkDevice) => {
      if (d.id === cable.sourceDeviceId || d.id === cable.targetDeviceId) {
        return {
          ...d,
          ports: d.ports.map(p => {
            if (d.id === cable.sourceDeviceId && p.id === cable.sourcePortId) return { ...p, connectedCableId: cable.id, status: 'up', linked: true };
            if (d.id === cable.targetDeviceId && p.id === cable.targetPortId) return { ...p, connectedCableId: cable.id, status: 'up', linked: true };
            return p;
          })
        };
      }
      return d;
    });
    return { cables: [...state.cables, cable], devices };
  }),

  removeCable: (id: string) => set((state: any) => {
    const cable = state.cables.find((c: any) => c.id === id);
    const devices = state.devices.map((d: NetworkDevice) => {
      if (cable && (d.id === cable.sourceDeviceId || d.id === cable.targetDeviceId)) {
        return {
          ...d,
          ports: d.ports.map(p => {
            if (p.connectedCableId === id) return { ...p, connectedCableId: null, status: 'down', linked: false };
            return p;
          })
        };
      }
      return d;
    });
    return {
      cables: state.cables.filter((c: any) => c.id !== id),
      devices
    };
  }),

  updateDevicePosition: (id: string, pos: { x: number; y: number }) => set((state: any) => ({
    devices: state.devices.map((d: NetworkDevice) => d.id === id ? { ...d, position: pos } : d)
  })),

  updateDevice: (id: string, updates: Partial<NetworkDevice>) => set((state: any) => ({
    devices: state.devices.map((d: NetworkDevice) => d.id === id ? { ...d, ...updates } : d)
  })),

  updatePortConfig: (deviceId: string, portId: string, config: any) => set((state: any) => ({
    devices: state.devices.map((d: NetworkDevice) => {
      if (d.id !== deviceId) return d;
      return {
        ...d,
        ports: d.ports.map(p => p.id === portId ? { ...p, config: { ...p.config, ...config } } : p)
      };
    })
  })),

  onPortClick: (deviceId: string, portId: string) => {
    const state = get();
    const pendingSfpModule = state.pendingSfpModule;

    // 1. SFP Insertion Logic
    if (pendingSfpModule) {
      const dev = state.devices.find((d: any) => d.id === deviceId);
      const port = dev?.ports.find((p: any) => p.id === portId);

      if (port && port.type === 'SFP') {
        state.insertSfp(deviceId, portId, pendingSfpModule);
        set({ pendingSfpModule: null, selectedPort: null });
        return { success: true, message: 'Module inserted' };
      }
    }

    // 2. Click-to-Connect Logic (SaaS style)
    if (state.selectedPort && (state.selectedPort.deviceId !== deviceId || state.selectedPort.portId !== portId)) {
      console.log('Click-to-Connect triggered:', state.selectedPort, '->', { deviceId, portId });
      const sourceDev = state.devices.find((d: any) => d.id === state.selectedPort?.deviceId);
      const targetDev = state.devices.find((d: any) => d.id === deviceId);
      const sourcePort = sourceDev?.ports.find((p: any) => p.id === state.selectedPort?.portId);
      const targetPort = targetDev?.ports.find((p: any) => p.id === portId);

      console.log('Source Port found:', !!sourcePort, 'Target Port found:', !!targetPort);

      // Check if both ports are available
      if (sourcePort && targetPort && !sourcePort.connectedCableId && !targetPort.connectedCableId) {
        const cableId = `cable-${Math.random().toString(36).substring(2, 9)}`;
        state.addCable({
          id: cableId,
          sourceDeviceId: state.selectedPort!.deviceId,
          sourcePortId: state.selectedPort!.portId,
          targetDeviceId: deviceId,
          targetPortId: portId,
          type: sourcePort.type === 'SFP' ? 'fiber' : 'copper',
          status: 'up'
        });
        console.log('Cable added via Click-to-Connect:', cableId);
        set({ selectedPort: null }); // Clear selection after connecting
        return { success: true, message: 'Connected' };
      } else {
        console.warn('Click-to-Connect failed: Ports occupied or not found');
      }
    }

    // Default: Select the port
    set({ selectedPort: { deviceId, portId } });
    return { success: true };
  },

  insertSfp: (deviceId: string, portId: string, _model: string) => set((state: any) => ({
    devices: state.devices.map((d: NetworkDevice) => {
      if (d.id !== deviceId) return d;
      return {
        ...d,
        ports: d.ports.map(p => p.id === portId ? { ...p, sfpModule: { model: _model, type: 'optical' } } : p)
      };
    })
  })),

  selectSfpModule: (model: any) => set({ pendingSfpModule: model }),

  loadSession: async () => ({ ok: true, source: 'local' }),
  saveRemote: async () => true,

  setTopology: (devices: NetworkDevice[], cables: NetworkCable[]) => {
    set({ devices, cables });
  }
});
