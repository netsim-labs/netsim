import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { createCliSlice } from '../store/slices/createCliSlice.js';
import { NetworkDevice, NetworkPort, NatSession, QosHistoryEntry } from '../types/NetworkTypes.js';

const buildCiscoPort = (name: string): NetworkPort => ({
  id: name,
  name,
  type: 'RJ45',
  status: 'up',
  stpStatus: 'forwarding',
  stpRole: 'DESI',
  config: {
    enabled: true,
    vlan: 10,
    mode: 'access',
    allowedVlans: [10, 20],
    qinqTunnel: false,
    portSecurity: {
      enabled: false,
      maxMacs: 1,
      sticky: false,
      stickyMacs: [],
      shutdownOnViolation: true
    },
    loopDetectEnabled: false,
    loopDetectAction: 'shutdown',
    bpduGuard: false,
    bpduFilter: false,
    portFast: false,
    loopGuard: false,
    qos: {
      limitMbps: undefined,
      shapePct: undefined,
      queues: []
    },
    ipAddress: '10.0.0.1',
    subnetMask: 24,
    description: 'Test port'
  },
  sfpModule: null,
  connectedCableId: null,
  bpduGuarded: false,
  loopGuarded: false,
  bpduFiltered: false,
  poePowered: false,
  speed: 1000
});

const buildCiscoDevice = (): NetworkDevice => ({
  id: 'cisco1',
  vendor: 'Cisco',
  hostname: 'CSW-1',
  model: 'Cisco-Catalyst-9300',
  macAddress: '00:11:22:33:44:55',
  stpPriority: 32768,
  ports: [buildCiscoPort('GigabitEthernet1/0/1')],
  position: { x: 0, y: 0 },
  vlans: [1, 10],
  consoleLogs: [],
  cliState: { view: 'user-view' },
  routingTable: [
    {
      destination: '10.0.0.0',
      mask: 24,
      proto: 'Static',
      pre: 10,
      cost: 1,
      nextHop: '10.0.0.254',
      interface: 'GigabitEthernet1/0/1'
    }
  ]
});

const createCliRunner = () => {
  let state: any = {
    activeConsoleId: 'cisco1',
    devices: [buildCiscoDevice()],
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
  const dev = state.devices.find((d: NetworkDevice) => d.id === 'cisco1');
  if (!dev) return [];
  return dev.consoleLogs.slice(-20);
};

test('Cisco show commands return expected tables', () => {
  const expectations: { cmd: string; matcher: (line: string) => boolean }[] = [
    { cmd: 'show vlan brief', matcher: line => line.includes('VLAN Name') },
    { cmd: 'show ip interface brief', matcher: line => line.includes('Interface              IP-Address') },
    { cmd: 'show ip route', matcher: line => line.includes('Codes: C - connected') },
    { cmd: 'show running-config', matcher: line => line.includes('Building configuration...') },
    { cmd: 'show version', matcher: line => line.includes('Cisco IOS XE Software') }
  ];

  expectations.forEach(({ cmd, matcher }) => {
    const { slice, getState } = createCliRunner();
    slice.executeCommand(cmd);
    const logs = lastLogLines(getState());
    assert.ok(logs.some((line: string) => matcher(line)), `Expected output for ${cmd}`);
  });
});

test('configure terminal shows Cisco prompt and toggles view', () => {
  const { slice, getState } = createCliRunner();
  slice.executeCommand('configure terminal');
  const state = getState();
  const logs = lastLogLines(state);
  assert.ok(logs.some((line: string) => line.includes('Enter configuration commands')));
  assert.strictEqual(state.devices[0].cliState.view, 'system-view');
});

test('copy running-config startup-config tracks version and time', () => {
  const { slice, getState } = createCliRunner();
  slice.executeCommand('copy running-config startup-config');
  const state = getState();
  const dev = state.devices[0];
  assert.strictEqual(dev.startupConfigVersion, 1);
  assert.ok(typeof dev.lastConfigSave === 'number');
  const logs = lastLogLines(state);
  assert.ok(logs.some((line: string) => line.includes('Destination filename')));
  assert.ok(logs.some((line: string) => line.includes('Startup configuration saved')));
});

test('show nat translations reports sessions and rules', () => {
  const { slice, getState } = createCliRunner();
  const state = getState();
  const dev = state.devices[0];
  const now = Date.now();
  const session: NatSession = {
    id: 'nat-session',
    ruleId: 'nat-rule',
    type: 'dynamic',
    protocol: 'tcp',
    privateIp: '10.0.0.5',
    publicIp: '203.0.113.5',
    createdAt: now,
    lastUsed: now
  };
  dev.natSessions = [session];
  dev.natRules = [
    { id: 'nat-rule', type: 'dynamic', publicIp: '203.0.113.5' }
  ];
  slice.executeCommand('show nat translations');
  const logs = lastLogLines(getState());
  assert.ok(logs.some((line: string) => line.includes('Inside Local')), 'translation header shown');
  assert.ok(logs.some((line: string) => line.includes('Configured NAT rules')), 'rules section shown');
});

test('show qos history renders recent events', () => {
  const { slice, getState } = createCliRunner();
  const state = getState();
  const dev = state.devices[0];
  const entry: QosHistoryEntry = {
    id: 'qos-event',
    timestamp: Date.now(),
    portName: 'GigabitEthernet1/0/1',
    note: 'limit 100Mbps, queue voice',
    limit: 100,
    queueName: 'voice',
    queueDscp: 46,
    queueWeight: 20
  };
  dev.qosHistory = [entry];
  slice.executeCommand('show qos history');
  const logs = lastLogLines(getState());
  assert.ok(logs.some((line: string) => line.includes('limit 100Mbps')));
  assert.ok(logs.some((line: string) => line.includes('queue voice')));
});

// ============================================================
// Test 5: NAT collision detection
// ============================================================

const buildHuaweiRouter = (): NetworkDevice => ({
  id: 'router1',
  vendor: 'NetSim',
  hostname: 'R1',
  model: 'NS-Router-IM8',
  macAddress: '00:11:22:33:44:55',
  stpPriority: 32768,
  ports: [buildCiscoPort('GE0/0/1')],
  position: { x: 0, y: 0 },
  vlans: [1],
  consoleLogs: [],
  cliState: { view: 'system-view' },
  routingTable: [],
  natRules: []
});

const createHuaweiCliRunner = () => {
  let state: any = {
    activeConsoleId: 'router1',
    devices: [buildHuaweiRouter()],
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

const lastRouterLogLines = (state: any) => {
  const dev = state.devices.find((d: NetworkDevice) => d.id === 'router1');
  if (!dev) return [];
  return dev.consoleLogs.slice(-20);
};

test('NAT static add detects public IP collision', () => {
  const { slice, getState } = createHuaweiCliRunner();

  // Add first NAT rule
  slice.executeCommand('nat static add 192.168.1.10 203.0.113.1');
  let logs = lastRouterLogLines(getState());
  assert.ok(logs.some((line: string) => line.includes('NAT static 192.168.1.10 -> 203.0.113.1 added')));

  // Try to add another rule with same public IP but different private IP
  slice.executeCommand('nat static add 192.168.1.20 203.0.113.1');
  logs = lastRouterLogLines(getState());
  assert.ok(
    logs.some((line: string) => line.includes('Error:') && line.includes('already mapped')),
    'Should detect public IP collision'
  );

  // Verify only one rule exists
  const state = getState();
  const dev = state.devices[0];
  assert.strictEqual(dev.natRules?.length, 1);
});

test('NAT static add allows same rule (duplicate check)', () => {
  const { slice, getState } = createHuaweiCliRunner();

  // Add first NAT rule
  slice.executeCommand('nat static add 192.168.1.10 203.0.113.1');

  // Try to add exact same rule again
  slice.executeCommand('nat static add 192.168.1.10 203.0.113.1');
  const logs = lastRouterLogLines(getState());
  assert.ok(
    logs.some((line: string) => line.includes('Error:') && line.includes('already exists')),
    'Should detect duplicate rule'
  );

  // Verify still only one rule
  const state = getState();
  const dev = state.devices[0];
  assert.strictEqual(dev.natRules?.length, 1);
});

test('NAT dynamic add detects collision with static rule', () => {
  const { slice, getState } = createHuaweiCliRunner();

  // Add static NAT rule first
  slice.executeCommand('nat static add 192.168.1.10 203.0.113.1');

  // Try to add dynamic rule with same public IP (without PAT)
  slice.executeCommand('nat dynamic add 203.0.113.1');
  let logs = lastRouterLogLines(getState());
  assert.ok(
    logs.some((line: string) => line.includes('Error:') && line.includes('already used by static')),
    'Should detect collision with static rule'
  );

  // Verify only static rule exists
  const state = getState();
  const dev = state.devices[0];
  assert.strictEqual(dev.natRules?.length, 1);
  assert.strictEqual(dev.natRules?.[0].type, 'static');
});

test('NAT dynamic add with PAT allows same public IP as static', () => {
  const { slice, getState } = createHuaweiCliRunner();

  // Add static NAT rule first
  slice.executeCommand('nat static add 192.168.1.10 203.0.113.1');

  // Add dynamic rule with PAT (should be allowed)
  slice.executeCommand('nat dynamic add 203.0.113.1 pat');
  const logs = lastRouterLogLines(getState());
  assert.ok(
    logs.some((line: string) => line.includes('NAT dynamic 203.0.113.1 (PAT) added')),
    'PAT rule should be allowed with same public IP'
  );

  // Verify both rules exist
  const state = getState();
  const dev = state.devices[0];
  assert.strictEqual(dev.natRules?.length, 2);
});
