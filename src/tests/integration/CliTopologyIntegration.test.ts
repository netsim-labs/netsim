import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { VlanCommand } from '../../store/slices/cli/commands/network/VlanCommand.js';
import { IpAddressCommand } from '../../store/slices/cli/commands/interface/IpAddressCommand.js';
import { OspfEnableCommand } from '../../store/slices/cli/commands/system/OspfCommand.js';
import { ShutdownCommand } from '../../store/slices/cli/commands/interface/ShutdownCommand.js';
import { NetworkDevice } from '../../types/NetworkTypes';

// Unit tests for CLI Command Pattern
// Tests that validate individual command logic and state modifications

// Helper to create mock device
const createMockDevice = (overrides: Partial<NetworkDevice> = {}): NetworkDevice => ({
  id: 'test-device',
  hostname: 'TestDevice',
  vendor: 'NetSim',
  model: 'NS-Switch-L3-24',
  macAddress: '00:11:22:33:44:55',
  routerId: '10.0.0.1',
  stpPriority: 32768,
  hasInternet: false,
  ospfEnabled: false,
  vlans: [1],
  ports: [{
    id: 'GE0/0/1',
    name: 'GE0/0/1',
    type: 'RJ45',
    status: 'down',
    stpStatus: 'forwarding',
    stpRole: 'DESI',
    config: {
      enabled: true,
      ipAddress: undefined,
      subnetMask: undefined,
      mode: 'access',
      vlan: 1
    },
    connectedCableId: null
  }],
  position: { x: 100, y: 100 },
  cliState: { view: 'user-view', currentInterfaceId: null, currentPoolName: null },
  consoleLogs: [],
  ...overrides
});

// Mock CLI profile
const mockProfile = {
  id: 'huawei' as const,
  label: 'Huawei',
  description: 'Mock Huawei profile',
  help: {
    'user-view': [],
    'system-view': [],
    'interface-view': [],
    'pool-view': []
  },
  suggestions: {
    'user-view': [],
    'system-view': [],
    'interface-view': [],
    'pool-view': []
  },
  aliases: {},
  registry: []
};

// Huawei VRP Scenarios
test('VlanCommand: should create VLANs in batch', () => {
  const device = createMockDevice({
    cliState: { view: 'system-view', currentInterfaceId: null, currentPoolName: null }
  });

  const command = new VlanCommand();
  const context = {
    device,
    devices: [device],
    cables: [],
    profile: mockProfile,
    rawInput: 'vlan batch 10 20 30',
    normalizedCommand: 'vlan batch 10 20 30',
    args: ['vlan', 'batch', '10', '20', '30'],
    cloneDevice: () => ({ ...device }),
    highlightTraffic: () => {},
    utils: {
      getNetworkAddress: () => '192.168.1.0',
      getNextIp: () => null,
      findPath: () => null,
      recomputeOspf: () => ({ devices: [device], events: [] }),
      generateUUID: () => 'uuid-123'
    }
  };

  const result = command.execute(context);

  assert.strictEqual(result.device?.vlans.includes(10), true);
  assert.strictEqual(result.device?.vlans.includes(20), true);
  assert.strictEqual(result.device?.vlans.includes(30), true);
  assert.ok(result.output.some(line => line.includes('Info: VLANs creadas')));
});

test('IpAddressCommand: should assign IP address to interface', () => {
  const device = createMockDevice({
    cliState: { view: 'interface-view', currentInterfaceId: 'GE0/0/1', currentPoolName: null }
  });

  const command = new IpAddressCommand();
  const context = {
    device,
    devices: [device],
    cables: [],
    profile: mockProfile,
    rawInput: 'ip address 192.168.1.1 24',
    normalizedCommand: 'ip address 192.168.1.1 24',
    args: ['ip', 'address', '192.168.1.1', '24'],
    cloneDevice: () => ({ ...device }),
    highlightTraffic: () => {},
    utils: {
      getNetworkAddress: (ip: string, mask: number) => `${ip.split('.').slice(0, mask > 24 ? 4 : mask > 16 ? 3 : mask > 8 ? 2 : 1).join('.')}.0`,
      getNextIp: () => null,
      findPath: () => null,
      recomputeOspf: () => ({ devices: [device], events: [] }),
      generateUUID: () => 'uuid-123'
    }
  };

  const result = command.execute(context);

  const port = result.device?.ports.find(p => p.id === 'GE0/0/1');
  assert.strictEqual(port?.config.ipAddress, '192.168.1.1');
  assert.strictEqual(port?.config.subnetMask, 24);
  assert.ok(result.output.some(line => line.includes('Info: IP 192.168.1.1 assigned.')));
});

test('OspfEnableCommand: should enable OSPF routing', () => {
  const device = createMockDevice({
    cliState: { view: 'system-view', currentInterfaceId: null, currentPoolName: null },
    ospfEnabled: false
  });

  const command = new OspfEnableCommand();
  const context = {
    device,
    devices: [device],
    cables: [],
    profile: mockProfile,
    rawInput: 'ospf enable',
    normalizedCommand: 'ospf enable',
    args: ['ospf', 'enable'],
    cloneDevice: () => ({ ...device }),
    highlightTraffic: () => {},
    utils: {
      getNetworkAddress: () => '192.168.1.0',
      getNextIp: () => null,
      findPath: () => null,
      recomputeOspf: () => ({ devices: [device], events: [] }),
      generateUUID: () => 'uuid-123'
    }
  };

  const result = command.execute(context);

  assert.strictEqual(result.device?.ospfEnabled, true);
  assert.ok(result.output.some(line => line.includes('Info: OSPF enabled.')));
});

test('ShutdownCommand: should shutdown interface', () => {
  const device = createMockDevice({
    cliState: { view: 'interface-view', currentInterfaceId: 'GE0/0/1', currentPoolName: null },
    ports: [{
      id: 'GE0/0/1',
      name: 'GE0/0/1',
      type: 'RJ45',
      status: 'up',
      stpStatus: 'forwarding',
      stpRole: 'DESI',
      config: {
        enabled: true,
        ipAddress: undefined,
        subnetMask: undefined,
        mode: 'access',
        vlan: 1
      },
      connectedCableId: null
    }]
  });

  const command = new ShutdownCommand();
  const context = {
    device,
    devices: [device],
    cables: [],
    profile: mockProfile,
    rawInput: 'shutdown',
    normalizedCommand: 'shutdown',
    args: ['shutdown'],
    cloneDevice: () => ({ ...device }),
    highlightTraffic: () => {},
    utils: {
      getNetworkAddress: () => '192.168.1.0',
      getNextIp: () => null,
      findPath: () => null,
      recomputeOspf: () => ({ devices: [device], events: [] }),
      generateUUID: () => 'uuid-123'
    }
  };

  const result = command.execute(context);

  const port = result.device?.ports.find(p => p.id === 'GE0/0/1');
  assert.strictEqual(port?.config.enabled, false);
  assert.strictEqual(port?.status, 'down');
});

test('ShutdownCommand: should undo shutdown interface', () => {
  const device = createMockDevice({
    cliState: { view: 'interface-view', currentInterfaceId: 'GE0/0/1', currentPoolName: null },
    ports: [{
      id: 'GE0/0/1',
      name: 'GE0/0/1',
      type: 'RJ45',
      status: 'down',
      stpStatus: 'forwarding',
      stpRole: 'DESI',
      config: {
        enabled: false,
        ipAddress: undefined,
        subnetMask: undefined,
        mode: 'access',
        vlan: 1
      },
      connectedCableId: null
    }]
  });

  const command = new ShutdownCommand();
  const context = {
    device,
    devices: [device],
    cables: [],
    profile: mockProfile,
    rawInput: 'undo shutdown',
    normalizedCommand: 'undo shutdown',
    args: ['undo', 'shutdown'],
    cloneDevice: () => ({ ...device }),
    highlightTraffic: () => {},
    utils: {
      getNetworkAddress: () => '192.168.1.0',
      getNextIp: () => null,
      findPath: () => null,
      recomputeOspf: () => ({ devices: [device], events: [] }),
      generateUUID: () => 'uuid-123'
    }
  };

  const result = command.execute(context);

  const port = result.device?.ports.find(p => p.id === 'GE0/0/1');
  assert.strictEqual(port?.config.enabled, true);
  assert.strictEqual(port?.status, 'down'); // Still down because no cable connected
});

// Cisco IOS Scenarios
test('VlanCommand (Cisco): should create VLAN', () => {
  const device = createMockDevice({
    vendor: 'Cisco',
    cliState: { view: 'system-view', currentInterfaceId: null, currentPoolName: null }
  });

  const command = new VlanCommand();
  const context = {
    device,
    devices: [device],
    cables: [],
    profile: { ...mockProfile, id: 'cisco' as const },
    rawInput: 'vlan 10',
    normalizedCommand: 'vlan 10',
    args: ['vlan', '10'],
    cloneDevice: () => ({ ...device }),
    highlightTraffic: () => {},
    utils: {
      getNetworkAddress: () => '192.168.1.0',
      getNextIp: () => null,
      findPath: () => null,
      recomputeOspf: () => ({ devices: [device], events: [] }),
      generateUUID: () => 'uuid-123'
    }
  };

  const result = command.execute(context);

  assert.strictEqual(result.device?.vlans.includes(10), true);
  assert.ok(result.output.some(line => line.includes('vlan 10')));
});

test('IpAddressCommand (Cisco): should assign IP address to interface', () => {
  const device = createMockDevice({
    vendor: 'Cisco',
    cliState: { view: 'interface-view', currentInterfaceId: 'GigabitEthernet0/0', currentPoolName: null },
    ports: [{
      id: 'GigabitEthernet0/0',
      name: 'GigabitEthernet0/0',
      type: 'RJ45',
      status: 'down',
      stpStatus: 'forwarding',
      stpRole: 'DESI',
      config: {
        enabled: true,
        ipAddress: undefined,
        subnetMask: undefined,
        mode: 'access',
        vlan: 1
      },
      connectedCableId: null
    }]
  });

  const command = new IpAddressCommand();
  const context = {
    device,
    devices: [device],
    cables: [],
    profile: { ...mockProfile, id: 'cisco' as const },
    rawInput: 'ip address 192.168.1.1 255.255.255.0',
    normalizedCommand: 'ip address 192.168.1.1 255.255.255.0',
    args: ['ip', 'address', '192.168.1.1', '255.255.255.0'],
    cloneDevice: () => ({ ...device }),
    highlightTraffic: () => {},
    utils: {
      getNetworkAddress: (ip: string, mask: number) => `${ip.split('.').slice(0, mask > 24 ? 4 : mask > 16 ? 3 : mask > 8 ? 2 : 1).join('.')}.0`,
      getNextIp: () => null,
      findPath: () => null,
      recomputeOspf: () => ({ devices: [device], events: [] }),
      generateUUID: () => 'uuid-123'
    }
  };

  const result = command.execute(context);

  const port = result.device?.ports.find(p => p.id === 'GigabitEthernet0/0');
  assert.strictEqual(port?.config.ipAddress, '192.168.1.1');
  assert.strictEqual(port?.config.subnetMask, 24);
});

test('OspfEnableCommand (Cisco): should enable OSPF routing', () => {
  const device = createMockDevice({
    vendor: 'Cisco',
    cliState: { view: 'system-view', currentInterfaceId: null, currentPoolName: null },
    ospfEnabled: false
  });

  const command = new OspfEnableCommand();
  const context = {
    device,
    devices: [device],
    cables: [],
    profile: { ...mockProfile, id: 'cisco' as const },
    rawInput: 'router ospf 1',
    normalizedCommand: 'router ospf 1',
    args: ['router', 'ospf', '1'],
    cloneDevice: () => ({ ...device }),
    highlightTraffic: () => {},
    utils: {
      getNetworkAddress: () => '192.168.1.0',
      getNextIp: () => null,
      findPath: () => null,
      recomputeOspf: () => ({ devices: [device], events: [] }),
      generateUUID: () => 'uuid-123'
    }
  };

  const result = command.execute(context);

  assert.strictEqual(result.device?.ospfEnabled, true);
});

test('ShutdownCommand (Cisco): should shutdown interface', () => {
  const device = createMockDevice({
    vendor: 'Cisco',
    cliState: { view: 'interface-view', currentInterfaceId: 'GigabitEthernet0/0', currentPoolName: null },
    ports: [{
      id: 'GigabitEthernet0/0',
      name: 'GigabitEthernet0/0',
      type: 'RJ45',
      status: 'up',
      stpStatus: 'forwarding',
      stpRole: 'DESI',
      config: {
        enabled: true,
        ipAddress: undefined,
        subnetMask: undefined,
        mode: 'access',
        vlan: 1
      },
      connectedCableId: null
    }]
  });

  const command = new ShutdownCommand();
  const context = {
    device,
    devices: [device],
    cables: [],
    profile: { ...mockProfile, id: 'cisco' as const },
    rawInput: 'shutdown',
    normalizedCommand: 'shutdown',
    args: ['shutdown'],
    cloneDevice: () => ({ ...device }),
    highlightTraffic: () => {},
    utils: {
      getNetworkAddress: () => '192.168.1.0',
      getNextIp: () => null,
      findPath: () => null,
      recomputeOspf: () => ({ devices: [device], events: [] }),
      generateUUID: () => 'uuid-123'
    }
  };

  const result = command.execute(context);

  const port = result.device?.ports.find(p => p.id === 'GigabitEthernet0/0');
  assert.strictEqual(port?.config.enabled, false);
  assert.strictEqual(port?.status, 'down');
});

test('ShutdownCommand (Cisco): should undo shutdown interface', () => {
  const device = createMockDevice({
    vendor: 'Cisco',
    cliState: { view: 'interface-view', currentInterfaceId: 'GigabitEthernet0/0', currentPoolName: null },
    ports: [{
      id: 'GigabitEthernet0/0',
      name: 'GigabitEthernet0/0',
      type: 'RJ45',
      status: 'down',
      stpStatus: 'forwarding',
      stpRole: 'DESI',
      config: {
        enabled: false,
        ipAddress: undefined,
        subnetMask: undefined,
        mode: 'access',
        vlan: 1
      },
      connectedCableId: null
    }]
  });

  const command = new ShutdownCommand();
  const context = {
    device,
    devices: [device],
    cables: [],
    profile: { ...mockProfile, id: 'cisco' as const },
    rawInput: 'no shutdown',
    normalizedCommand: 'no shutdown',
    args: ['no', 'shutdown'],
    cloneDevice: () => ({ ...device }),
    highlightTraffic: () => {},
    utils: {
      getNetworkAddress: () => '192.168.1.0',
      getNextIp: () => null,
      findPath: () => null,
      recomputeOspf: () => ({ devices: [device], events: [] }),
      generateUUID: () => 'uuid-123'
    }
  };

  const result = command.execute(context);

  const port = result.device?.ports.find(p => p.id === 'GigabitEthernet0/0');
  assert.strictEqual(port?.config.enabled, true);
  assert.strictEqual(port?.status, 'down'); // Still down because no cable connected
});
