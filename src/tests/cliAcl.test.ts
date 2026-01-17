import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { createCliSlice } from '../store/slices/createCliSlice.js';
import { NetworkDevice, NetworkPort, NetworkCable } from '../types/NetworkTypes.js';

const buildPort = (name: string, ip?: string): NetworkPort => ({
  id: name,
  name,
  type: 'RJ45',
  status: 'up',
  stpStatus: 'forwarding',
  stpRole: 'ROOT',
  config: {
    mode: 'access',
    enabled: true,
    ipAddress: ip,
    subnetMask: ip ? 24 : 0
  }
});

const buildDevice = (id: string, hostname: string, portName: string, ip?: string): NetworkDevice => ({
  id,
  vendor: 'NetSim',
  hostname,
  model: 'NS-Switch-L3-24',
  macAddress: 'AA:BB:CC:DD:EE:FF',
  stpPriority: 32768,
  ports: [buildPort(portName, ip)],
  position: { x: 0, y: 0 },
  vlans: [1],
  consoleLogs: [],
  cliState: { view: 'user-view' },
  routingTable: []
});

const createCliRunner = (devices: NetworkDevice[], cables: NetworkCable[] = [], activeConsoleId?: string) => {
  let state: any = {
    activeConsoleId: activeConsoleId ?? devices[0].id,
    devices,
    cables,
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

const lastDeviceLogs = (state: any, deviceId: string) => {
  const dev = state.devices.find((d: NetworkDevice) => d.id === deviceId);
  return dev ? dev.consoleLogs.slice(-20) : [];
};

test('acl rule add records 5-tuple metadata and blocks duplicates', () => {
  const device = buildDevice('switch1', 'Switch 1', 'GigabitEthernet1/0/1');
  const { slice, getState } = createCliRunner([device]);

  slice.executeCommand('acl rule add block-tcp deny GigabitEthernet1/0/1 out protocol=tcp src=10.0.0.0/24 dst=192.168.1.0/24 srcport=1000 dstport=443');
  const state = getState();
  const rule = state.devices[0].aclRules?.[0];

  assert.strictEqual(rule?.name, 'block-tcp');
  assert.strictEqual(rule?.action, 'deny');
  assert.strictEqual(rule?.direction, 'out');
  assert.strictEqual(rule?.interfaceId, 'GigabitEthernet1/0/1');
  assert.strictEqual(rule?.protocol, 'tcp');
  assert.strictEqual(rule?.srcCidr, '10.0.0.0/24');
  assert.strictEqual(rule?.dstCidr, '192.168.1.0/24');
  assert.strictEqual(rule?.srcPort, 1000);
  assert.strictEqual(rule?.dstPort, 443);
  assert.strictEqual(rule?.hits, 0);

  slice.executeCommand('acl rule add block-tcp deny GigabitEthernet1/0/1 out');
  const duplicateLogs = lastDeviceLogs(getState(), 'switch1');
  assert.ok(
    duplicateLogs.some((line: string) => line.includes('Ya existe una regla')),
    'Duplicate rule should log an error'
  );
  assert.strictEqual(getState().devices[0].aclRules?.length, 1);
});

test('acl rule add denies traffic and bumps hits when ping blocked', () => {
  const source = buildDevice('src', 'Source', 'GigabitEthernet1/0/1', '10.0.0.1');
  const target = buildDevice('dst', 'Target', 'GigabitEthernet1/0/2', '10.0.1.2');
  const cables: NetworkCable[] = [
    {
      id: 'cable-1',
      type: 'Copper',
      sourceDeviceId: 'src',
      sourcePortId: 'GigabitEthernet1/0/1',
      targetDeviceId: 'dst',
      targetPortId: 'GigabitEthernet1/0/2'
    }
  ];
  const { slice, getState } = createCliRunner([source, target], cables, 'src');

  slice.executeCommand('acl rule add block-icmp deny GigabitEthernet1/0/1 out protocol=icmp src=10.0.0.0/24 dst=10.0.1.0/24');
  slice.executeCommand('ping 10.0.1.2');

  const state = getState();
  const logs = lastDeviceLogs(state, 'src');
  assert.ok(
    logs.some((line: string) => line.includes('Request time out') && line.includes('ACL deny')),
    'Ping should indicate ACL deny'
  );
  const hits = state.devices[0].aclRules?.[0].hits;
  assert.strictEqual(hits, 1, 'ACL hits counter should increment');
  assert.ok(state.packetTrace?.reason?.includes('ACL deny'), 'PacketTrace should report ACL drop');
});
