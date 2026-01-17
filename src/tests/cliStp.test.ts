import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { createCliSlice } from '../store/slices/createCliSlice.js';
import { NetworkDevice } from '../types/NetworkTypes.js';

const buildDevice = (): NetworkDevice => ({
  id: 'stp1',
  vendor: 'NetSim',
  hostname: 'STP-1',
  model: 'NS-Switch-L3-24',
  macAddress: '00:11:22:33:44:66',
  stpPriority: 32768,
  ports: [
    {
      id: 'port1',
      name: 'GE0/0/1',
      type: 'RJ45',
      status: 'up',
      stpStatus: 'forwarding',
      stpRole: 'DESI',
      config: {
        mode: 'access',
        enabled: true,
        vlan: 10,
        portFast: true,
        bpduGuard: true,
        bpduFilter: true,
        loopGuard: true,
        loopDetectEnabled: true
      },
      bpduGuardHits: 3,
      loopGuardHits: 2,
      loopDetected: true,
      bpduGuarded: true,
      loopGuarded: true,
      bpduFiltered: true
    }
  ],
  position: { x: 0, y: 0 },
  vlans: [10],
  consoleLogs: [],
  cliState: { view: 'user-view' }
});

const createRunner = () => {
  let state: any = {
    activeConsoleId: 'stp1',
    devices: [buildDevice()],
    cables: [],
    commandUsage: {},
    activeVendorProfileId: null
  };
  const get = () => state;
  const set = (updater: any) => {
    state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
    return state;
  };
  const slice = createCliSlice(set as any, get as any, {} as any);
  return {
    slice,
    getState: () => state
  };
};

const lastLogLines = (state: any) => {
  const dev = state.devices.find((d: NetworkDevice) => d.id === 'stp1');
  if (!dev) return [];
  return dev.consoleLogs.slice(-20);
};

test('display stp shows guard flags and counters', () => {
  const { slice, getState } = createRunner();
  slice.executeCommand('display stp');
  const logs = lastLogLines(getState());
  assert.ok(logs.some((line: string) => line.includes('PortFast')), 'flags show PortFast');
  assert.ok(logs.some((line: string) => line.includes('BPDU Guard Hits 3')), 'counters include BPDU hits');
  assert.ok(logs.some((line: string) => line.includes('Loop Guard Hits 2')), 'counters include loop guard hits');
});

test('display stp counters lists per-port hits and states', () => {
  const { slice, getState } = createRunner();
  slice.executeCommand('display stp counters');
  const logs = lastLogLines(getState());
  assert.ok(logs.some((line: string) => line.includes('BPDU Guard Hits')));
  assert.ok(logs.some((line: string) => line.includes('Loop Guard Hits')));
  assert.ok(logs.some((line: string) => line.includes('Yes')), 'loop and filter states printed');
});
