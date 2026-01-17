import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  isLinkPassable,
  enforcePoEPower,
  applyLoopbackDetect,
  applyDhcpForCable,
  recomputeOspf,
  getNetworkAddress
} from '../store/slices/createTopologySlice.js';
import { NetworkCable, NetworkDevice } from '../types/NetworkTypes.js';

const buildPort = (name: string, vlan: number, mode: 'access' | 'trunk' = 'access'): any => ({
  id: name,
  name,
  type: 'RJ45',
  status: 'up',
  stpStatus: 'forwarding',
  stpRole: 'DESI',
  config: { mode, vlan, enabled: true },
  sfpModule: null,
  speed: 1000,
  connectedCableId: null
});

const buildDevice = (id: string): NetworkDevice => ({
  id,
  vendor: 'NetSim',
  hostname: id,
  model: 'NS-Switch-L3-24',
  macAddress: '00:00:00:00:00:00',
  stpPriority: 32768,
  ports: [buildPort(`${id}-p1`, 10)],
  position: { x: 0, y: 0 },
  vlans: [10],
  consoleLogs: [],
  cliState: { view: 'user-view' },
  dhcpEnabled: false,
  dhcpPools: [],
  routingTable: []
});

const buildCable = (pair: [NetworkDevice, string, NetworkDevice, string]): NetworkCable => ({
  id: `${pair[0].id}-${pair[2].id}`,
  type: 'Copper',
  sourceDeviceId: pair[0].id,
  sourcePortId: pair[1],
  targetDeviceId: pair[2].id,
  targetPortId: pair[3]
});

test('isLinkPassable respects VLAN mismatch', () => {
  const devA = buildDevice('A');
  const devB = buildDevice('B');
  devB.ports = [buildPort('B-p1', 20)]; // different vlan
  const cable = buildCable([devA, 'A-p1', devB, 'B-p1']);
  assert.strictEqual(isLinkPassable(cable, [devA, devB], 10), false);
});

test('isLinkPassable allows shared VLAN', () => {
  const devA = buildDevice('A');
  devA.ports = [buildPort('A-p1', 5)];
  const devB = buildDevice('B');
  devB.ports = [buildPort('B-p1', 5)];
  const cable = buildCable([devA, 'A-p1', devB, 'B-p1']);
  assert.strictEqual(isLinkPassable(cable, [devA, devB], 5), true);
});

const createBaseDevice = (id: string, model: NetworkDevice['model'] = 'NS-Switch-L3-24'): NetworkDevice => ({
  ...buildDevice(id),
  model,
  ports: [
    {
      id: `${id}-p1`,
      name: 'GE0/0/1',
      type: 'RJ45',
      status: 'up',
      stpStatus: 'forwarding',
      stpRole: 'DESI',
      config: {
        mode: 'access',
        enabled: true,
        loopDetectEnabled: model === 'NS-Switch-L3-24',
        loopDetectAction: 'shutdown' as const,
        loopGuard: true,
        portFast: true,
        bpduGuard: true,
        bpduFilter: false
      },
      sfpModule: null,
      speed: 1000,
      connectedCableId: null,
      loopDetected: false,
      bpduGuarded: false,
      bpduGuardHits: 0,
      loopGuarded: false,
      loopGuardHits: 0,
      bpduFiltered: false
    }
  ]
});

test('applyLoopbackDetect logs and shuts down loopback ports', () => {
  const device = createBaseDevice('LoopSwitch', 'NS-Switch-L3-24');
  const loopCable: NetworkCable = {
    id: 'loop',
    type: 'Copper',
    sourceDeviceId: device.id,
    sourcePortId: device.ports[0].id,
    targetDeviceId: device.id,
    targetPortId: device.ports[0].id
  };
  const result = applyLoopbackDetect([device], [loopCable]);
  const port = result[0].ports[0];
  assert.strictEqual(port.status, 'down');
  assert.strictEqual(port.loopDetected, true);
});

test('applyLoopbackDetect increments BPDU guard hits on unauthorized BPDUs', () => {
  const devA = createBaseDevice('A', 'NS-Switch-L3-24');
  const devB = createBaseDevice('B', 'NS-Switch-L3-24');
  const cable: NetworkCable = {
    id: 'bpdu',
    type: 'Copper',
    sourceDeviceId: devA.id,
    sourcePortId: devA.ports[0].id,
    targetDeviceId: devB.id,
    targetPortId: devB.ports[0].id
  };
  const result = applyLoopbackDetect([devA, devB], [cable]);
  const port = result.find(d => d.id === devA.id)?.ports[0];
  assert.strictEqual(port?.bpduGuardHits, 1);
  assert.strictEqual(port?.bpduGuarded, true);
});

test('applyLoopbackDetect increments loop guard hits when loops happen', () => {
  const device = createBaseDevice('LoopGuard', 'NS-Switch-L3-24');
  const loopCable: NetworkCable = {
    id: 'loopguard',
    type: 'Copper',
    sourceDeviceId: device.id,
    sourcePortId: device.ports[0].id,
    targetDeviceId: device.id,
    targetPortId: device.ports[0].id
  };
  const result = applyLoopbackDetect([device], [loopCable]);
  const port = result.find(d => d.id === device.id)?.ports[0];
  assert.strictEqual(port?.loopGuardHits, 1);
  assert.strictEqual(port?.loopGuarded, true);
});

test('applyDhcpForCable assigns DHCP lease from router', () => {
  const server = createBaseDevice('Router', 'NS-Router-IM8');
  server.dhcpEnabled = true;
  server.dhcpPools = [{
    id: 'pool1',
    name: 'edge',
    network: '10.20.30.0',
    mask: 24,
    gateway: '10.20.30.1',
    dns: '8.8.8.8',
    usedIps: [],
    leases: []
  }];
  const client = createBaseDevice('Client');
  const cable: NetworkCable = {
    id: 'dhcp',
    type: 'Copper',
    sourceDeviceId: server.id,
    sourcePortId: server.ports[0].id,
    targetDeviceId: client.id,
    targetPortId: client.ports[0].id
  };
  const updated = applyDhcpForCable([server, client], cable);
  const clientPort = updated.find(d => d.id === client.id)?.ports[0];
  assert.strictEqual(clientPort?.config.ipAddress, '10.20.30.2');
});

test('enforcePoEPower lowers link when non-PoE peer', () => {
  const poeDevice = createBaseDevice('AP', 'AP-POE');
  const switchDevice = createBaseDevice('Switch', 'NS-Switch-L3-24');
  const cable: NetworkCable = {
    id: 'poe',
    type: 'Copper',
    sourceDeviceId: poeDevice.id,
    sourcePortId: poeDevice.ports[0].id,
    targetDeviceId: switchDevice.id,
    targetPortId: switchDevice.ports[0].id
  };
  const result = enforcePoEPower([poeDevice, switchDevice], [cable]);
  const apPort = result.find(d => d.id === poeDevice.id)?.ports[0];
  assert.strictEqual(apPort?.status, 'down');
});

const buildEthTrunkDevice = (id: string): NetworkDevice => {
  const device = createBaseDevice(id);
  const port = device.ports[0];
  port.config.bpduGuard = false;
  port.config.portFast = false;
  port.config.loopGuard = false;
  port.ethTrunkId = '1';
  device.ethTrunks = [
    {
      id: '1',
      name: 'Eth-Trunk1',
      members: [port.id],
      enabled: true,
      mode: 'static'
    }
  ];
  return device;
};

test('recomputeOspf brings eth-trunk up when both peers share the same trunk', () => {
  const trunkA = buildEthTrunkDevice('TrunkA');
  const trunkB = buildEthTrunkDevice('TrunkB');
  const cable: NetworkCable = {
    id: 'trunk',
    type: 'Copper',
    sourceDeviceId: trunkA.id,
    sourcePortId: trunkA.ports[0].id,
    targetDeviceId: trunkB.id,
    targetPortId: trunkB.ports[0].id
  };
  const { devices: updated } = recomputeOspf([trunkA, trunkB], [cable]);
  const updatedA = updated.find(d => d.id === trunkA.id);
  const updatedB = updated.find(d => d.id === trunkB.id);
  assert.strictEqual(updatedA?.ethTrunks?.[0]?.actorState, 'bundled');
  assert.strictEqual(updatedA?.ethTrunks?.[0]?.partnerState, 'bundled');
  assert.strictEqual(updatedB?.ethTrunks?.[0]?.actorState, 'bundled');
  assert.strictEqual(updatedB?.ethTrunks?.[0]?.partnerState, 'bundled');
});

const buildVrrpRouter = (id: string, priority: number): NetworkDevice => {
  const device = createBaseDevice(id);
  device.routerId = `10.0.0.${priority}`;
  device.vlanifs = [
    {
      id: 'vlanif10',
      vlanId: 10,
      ipAddress: '192.168.10.1',
      subnetMask: 24,
      enabled: true,
      vrrp: [
        {
          id: '1',
          virtualIp: '192.168.10.1',
          priority,
          state: 'BACKUP',
          advertiseInterval: 1,
          preemptMode: true,
          preemptDelay: 0
        }
      ]
    }
  ];
  return device;
};

test('recomputeOspf elects the highest priority VRRP master', () => {
  const master = buildVrrpRouter('RouterA', 120);
  const backup = buildVrrpRouter('RouterB', 100);
  const cable: NetworkCable = {
    id: 'vrrp',
    type: 'Copper',
    sourceDeviceId: master.id,
    sourcePortId: master.ports[0].id,
    targetDeviceId: backup.id,
    targetPortId: backup.ports[0].id
  };
  const { devices: updated } = recomputeOspf([master, backup], [cable]);
  const updatedMaster = updated.find(d => d.id === master.id);
  const updatedBackup = updated.find(d => d.id === backup.id);
  const masterGroup = updatedMaster?.vlanifs?.[0]?.vrrp?.[0];
  const backupGroup = updatedBackup?.vlanifs?.[0]?.vrrp?.[0];
  assert.strictEqual(masterGroup?.state, 'MASTER');
  assert.strictEqual(backupGroup?.state, 'BACKUP');
});

// ============================================================
// Tests for bug fixes (P0 corrections)
// ============================================================

// Test 1: getNetworkAddress() with arbitrary CIDR masks
test('getNetworkAddress handles /24 mask correctly', () => {
  assert.strictEqual(getNetworkAddress('192.168.1.100', 24), '192.168.1.0');
});

test('getNetworkAddress handles /25 mask correctly', () => {
  // 192.168.1.100 with /25 (128 addresses) -> 192.168.1.0 (first half)
  assert.strictEqual(getNetworkAddress('192.168.1.100', 25), '192.168.1.0');
  // 192.168.1.200 with /25 -> 192.168.1.128 (second half)
  assert.strictEqual(getNetworkAddress('192.168.1.200', 25), '192.168.1.128');
});

test('getNetworkAddress handles /30 mask correctly (point-to-point)', () => {
  // 10.0.0.1 with /30 -> 10.0.0.0
  assert.strictEqual(getNetworkAddress('10.0.0.1', 30), '10.0.0.0');
  // 10.0.0.5 with /30 -> 10.0.0.4
  assert.strictEqual(getNetworkAddress('10.0.0.5', 30), '10.0.0.4');
  // 10.0.0.6 with /30 -> 10.0.0.4
  assert.strictEqual(getNetworkAddress('10.0.0.6', 30), '10.0.0.4');
});

test('getNetworkAddress handles /16 and /8 masks', () => {
  assert.strictEqual(getNetworkAddress('172.16.50.100', 16), '172.16.0.0');
  assert.strictEqual(getNetworkAddress('10.50.100.200', 8), '10.0.0.0');
});

test('getNetworkAddress handles /32 (host) and /0 (default)', () => {
  assert.strictEqual(getNetworkAddress('8.8.8.8', 32), '8.8.8.8');
  assert.strictEqual(getNetworkAddress('8.8.8.8', 0), '0.0.0.0');
});

test('getNetworkAddress handles invalid input gracefully', () => {
  assert.strictEqual(getNetworkAddress('invalid', 24), '0.0.0.0');
  assert.strictEqual(getNetworkAddress('192.168.1.1', -1), '0.0.0.0');
  assert.strictEqual(getNetworkAddress('192.168.1.1', 33), '0.0.0.0');
});

// Test 2: QinQ tunnel validation (no longer bypasses VLAN check)
test('isLinkPassable with QinQ still validates VLAN', () => {
  const devA = buildDevice('QinqA');
  devA.ports = [{
    ...buildPort('QinqA-p1', 100),
    config: { mode: 'access' as const, vlan: 100, enabled: true, qinqTunnel: true }
  }];
  const devB = buildDevice('QinqB');
  devB.ports = [{
    ...buildPort('QinqB-p1', 200), // Different VLAN
    config: { mode: 'access' as const, vlan: 200, enabled: true, qinqTunnel: true }
  }];
  const cable = buildCable([devA, 'QinqA-p1', devB, 'QinqB-p1']);

  // Should NOT pass for VLAN 100 because devB has VLAN 200
  assert.strictEqual(isLinkPassable(cable, [devA, devB], 100), false);
  // Should NOT pass for VLAN 200 because devA has VLAN 100
  assert.strictEqual(isLinkPassable(cable, [devA, devB], 200), false);
});

test('isLinkPassable with QinQ allows matching VLAN', () => {
  const devA = buildDevice('QinqA');
  devA.ports = [{
    ...buildPort('QinqA-p1', 100),
    config: { mode: 'access' as const, vlan: 100, enabled: true, qinqTunnel: true }
  }];
  const devB = buildDevice('QinqB');
  devB.ports = [{
    ...buildPort('QinqB-p1', 100), // Same VLAN
    config: { mode: 'access' as const, vlan: 100, enabled: true, qinqTunnel: true }
  }];
  const cable = buildCable([devA, 'QinqA-p1', devB, 'QinqB-p1']);

  // Should pass for VLAN 100 since both ports have it
  assert.strictEqual(isLinkPassable(cable, [devA, devB], 100), true);
});

// Test 3: STP/DR election is deterministic (uses priority + MAC)
test('recomputeOspf DR election uses STP priority (lower wins)', () => {
  const buildOspfDevice = (id: string, priority: number, mac: string): NetworkDevice => {
    const dev = createBaseDevice(id);
    dev.ospfEnabled = true;
    dev.stpPriority = priority;
    dev.macAddress = mac;
    dev.ports = [{
      id: `${id}-p1`,
      name: 'GE0/0/1',
      type: 'RJ45',
      status: 'up',
      stpStatus: 'forwarding',
      stpRole: 'DESI',
      config: {
        mode: 'routed' as const,
        enabled: true,
        ipAddress: `10.0.0.${id === 'DR' ? 1 : id === 'BDR' ? 2 : 3}`,
        subnetMask: 24
      },
      sfpModule: null,
      speed: 1000,
      connectedCableId: null
    }];
    return dev;
  };

  // DR has lowest priority (4096), should win
  const dr = buildOspfDevice('DR', 4096, 'aa:bb:cc:dd:ee:ff');
  // BDR has higher priority (32768)
  const bdr = buildOspfDevice('BDR', 32768, '00:00:00:00:00:01');
  // DROther has even higher priority
  const other = buildOspfDevice('Other', 61440, '00:00:00:00:00:02');

  const cable1: NetworkCable = {
    id: 'c1', type: 'Copper',
    sourceDeviceId: dr.id, sourcePortId: 'DR-p1',
    targetDeviceId: bdr.id, targetPortId: 'BDR-p1'
  };
  const cable2: NetworkCable = {
    id: 'c2', type: 'Copper',
    sourceDeviceId: bdr.id, sourcePortId: 'BDR-p1',
    targetDeviceId: other.id, targetPortId: 'Other-p1'
  };

  const { devices: updated } = recomputeOspf([dr, bdr, other], [cable1, cable2]);

  const updatedDr = updated.find(d => d.id === 'DR');
  const updatedBdr = updated.find(d => d.id === 'BDR');

  assert.strictEqual(updatedDr?.ospfRole, 'DR');
  assert.strictEqual(updatedBdr?.ospfRole, 'BDR');
});

test('recomputeOspf DR election uses MAC when priorities tie', () => {
  const buildOspfDevice = (id: string, mac: string): NetworkDevice => {
    const dev = createBaseDevice(id);
    dev.ospfEnabled = true;
    dev.stpPriority = 32768; // Same priority
    dev.macAddress = mac;
    dev.ports = [{
      id: `${id}-p1`,
      name: 'GE0/0/1',
      type: 'RJ45',
      status: 'up',
      stpStatus: 'forwarding',
      stpRole: 'DESI',
      config: {
        mode: 'routed' as const,
        enabled: true,
        ipAddress: `10.0.0.${id === 'LowMac' ? 1 : 2}`,
        subnetMask: 24
      },
      sfpModule: null,
      speed: 1000,
      connectedCableId: null
    }];
    return dev;
  };

  // Both have same priority, lower MAC should win
  const lowMac = buildOspfDevice('LowMac', '00:00:00:00:00:01');
  const highMac = buildOspfDevice('HighMac', 'ff:ff:ff:ff:ff:ff');

  const cable: NetworkCable = {
    id: 'c1', type: 'Copper',
    sourceDeviceId: lowMac.id, sourcePortId: 'LowMac-p1',
    targetDeviceId: highMac.id, targetPortId: 'HighMac-p1'
  };

  const { devices: updated } = recomputeOspf([lowMac, highMac], [cable]);

  const updatedLow = updated.find(d => d.id === 'LowMac');
  const updatedHigh = updated.find(d => d.id === 'HighMac');

  assert.strictEqual(updatedLow?.ospfRole, 'DR');
  assert.strictEqual(updatedHigh?.ospfRole, 'BDR');
});

// Test 4: OSPF validates same subnet for adjacency
test('recomputeOspf requires same subnet for neighbor formation', () => {
  const buildOspfRouter = (id: string, ip: string, mask: number): NetworkDevice => {
    const dev = createBaseDevice(id);
    dev.ospfEnabled = true;
    dev.stpPriority = 32768;
    dev.macAddress = `00:00:00:00:00:0${id.charCodeAt(0) % 10}`;
    dev.ports = [{
      id: `${id}-p1`,
      name: 'GE0/0/1',
      type: 'RJ45',
      status: 'up',
      stpStatus: 'forwarding',
      stpRole: 'DESI',
      config: {
        mode: 'routed' as const,
        enabled: true,
        ipAddress: ip,
        subnetMask: mask
      },
      sfpModule: null,
      speed: 1000,
      connectedCableId: null
    }];
    return dev;
  };

  // Different subnets - should NOT form OSPF adjacency
  const routerA = buildOspfRouter('A', '10.0.1.1', 24); // 10.0.1.0/24
  const routerB = buildOspfRouter('B', '10.0.2.1', 24); // 10.0.2.0/24

  const cable: NetworkCable = {
    id: 'c1', type: 'Copper',
    sourceDeviceId: routerA.id, sourcePortId: 'A-p1',
    targetDeviceId: routerB.id, targetPortId: 'B-p1'
  };

  const { devices: updated } = recomputeOspf([routerA, routerB], [cable]);

  const updatedA = updated.find(d => d.id === 'A');
  const updatedB = updated.find(d => d.id === 'B');

  // No OSPF neighbors should form due to subnet mismatch
  assert.strictEqual(updatedA?.ospfNeighbors?.length ?? 0, 0);
  assert.strictEqual(updatedB?.ospfNeighbors?.length ?? 0, 0);
});

test('recomputeOspf forms adjacency when IPs are in same subnet', () => {
  const buildOspfRouter = (id: string, ip: string, mask: number): NetworkDevice => {
    const dev = createBaseDevice(id);
    dev.ospfEnabled = true;
    dev.stpPriority = 32768;
    dev.macAddress = `00:00:00:00:00:0${id.charCodeAt(0) % 10}`;
    dev.ports = [{
      id: `${id}-p1`,
      name: 'GE0/0/1',
      type: 'RJ45',
      status: 'up',
      stpStatus: 'forwarding',
      stpRole: 'DESI',
      config: {
        mode: 'routed' as const,
        enabled: true,
        ipAddress: ip,
        subnetMask: mask
      },
      sfpModule: null,
      speed: 1000,
      connectedCableId: null
    }];
    return dev;
  };

  // Same subnet - should form OSPF adjacency
  const routerA = buildOspfRouter('A', '10.0.1.1', 24);
  const routerB = buildOspfRouter('B', '10.0.1.2', 24);

  const cable: NetworkCable = {
    id: 'c1', type: 'Copper',
    sourceDeviceId: routerA.id, sourcePortId: 'A-p1',
    targetDeviceId: routerB.id, targetPortId: 'B-p1'
  };

  const { devices: updated } = recomputeOspf([routerA, routerB], [cable]);

  const updatedA = updated.find(d => d.id === 'A');
  const updatedB = updated.find(d => d.id === 'B');

  // OSPF neighbors should form
  assert.strictEqual(updatedA?.ospfNeighbors?.length ?? 0, 1);
  assert.strictEqual(updatedB?.ospfNeighbors?.length ?? 0, 1);
});
