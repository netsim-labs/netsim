import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { createCliSlice } from '../store/slices/createCliSlice.js';
import { NetworkDevice, NetworkPort } from '../types/NetworkTypes.js';

const buildPort = (name: string, ip?: string): NetworkPort => ({
  id: name,
  name,
  type: 'RJ45',
  status: 'up',
  stpStatus: 'forwarding',
  stpRole: 'DESI',
  config: {
    mode: 'access',
    enabled: true,
    ipAddress: ip,
    subnetMask: 24,
    vlan: 1,
    description: `Port ${name}`
  },
  sfpModule: null,
  speed: 1000,
  connectedCableId: null
});

const buildDevice = (): NetworkDevice => ({
  id: 'export-switch',
  vendor: 'NetSim',
  hostname: 'ExportSwitch',
  model: 'NS-Switch-L3-24',
  macAddress: 'AA:BB:CC:00:11:22',
  stpPriority: 32768,
  ports: [buildPort('GigabitEthernet1/0/1', '10.0.0.1')],
  position: { x: 0, y: 0 },
  vlans: [1, 10],
  consoleLogs: [],
  cliState: { view: 'user-view' },
  dhcpEnabled: false,
  dhcpPools: [],
  routingTable: []
});

const createRunner = () => {
  let state: any = {
    devices: [buildDevice()],
    cables: [],
    activeConsoleId: 'export-switch',
    commandUsage: {},
    activeVendorProfileId: null
  };
  const get = () => state;
  const set = (updater: any) => {
    state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
    return state;
  };
  const slice = createCliSlice(set as any, get as any, {} as any);
  return { slice, getState: () => state };
};

test('exportRunningConfig emits a text-based running configuration', () => {
  const { slice } = createRunner();
  const result = slice.exportRunningConfig();
  assert.ok(result.includes('hostname ExportSwitch'));
  assert.ok(result.includes('vendor NetSim'));
  assert.ok(result.includes('interface GigabitEthernet1/0/1'));
  assert.ok(result.includes('switchport access vlan 10'));
});
