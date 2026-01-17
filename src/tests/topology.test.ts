import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { connectPorts, ConnectPortsSelection, enforcePoEPower } from '../store/slices/createTopologySlice.js';
import { CableType, NetworkDevice } from '../types/NetworkTypes.js';

const createDeviceWithModel = (id: string, model: string): NetworkDevice => ({
  ...createDevice(id),
  model: model as NetworkDevice['model'],
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
        enabled: true
      }
    }
  ]
});

const createDevice = (id: string): NetworkDevice => ({
  id,
  vendor: 'NetSim',
  hostname: id,
  model: 'NS-Switch-L3-24',
  macAddress: '00:00:00:00:00:00',
  stpPriority: 32768,
  ports: [
    {
      id: `${id}-p1`,
      name: 'GE0/0/1',
      type: 'RJ45',
      status: 'down',
      stpStatus: 'forwarding',
      stpRole: 'DESI',
      config: {
        mode: 'access',
        enabled: true
      }
    }
  ],
  position: { x: 0, y: 0 },
  vlans: [1],
  consoleLogs: [],
  cliState: { view: 'user-view' },
});

test('connectPorts connects two ports atomically without stale up statuses', () => {
  const devices = [createDevice('A'), createDevice('B')];
  const selection: ConnectPortsSelection = { deviceId: 'A', portId: 'A-p1', portType: 'RJ45' };
  const result = connectPorts({
    devices,
    cables: [],
    selectedPort: selection,
    targetDeviceId: 'B',
    targetPortId: 'B-p1'
  });
  assert.ok(result);
  assert.strictEqual(result?.cables.length, 1);
  assert.strictEqual(result?.devices[0].ports[0].status, 'up');
  assert.strictEqual(result?.devices[1].ports[0].status, 'up');
});

test('connectPorts removes old cables and shuts down orphaned ports', () => {
  const devices = [createDevice('A'), createDevice('B'), createDevice('C')];
  const selection: ConnectPortsSelection = { deviceId: 'A', portId: 'A-p1', portType: 'RJ45' };
  const first = connectPorts({
    devices,
    cables: [],
    selectedPort: selection,
    targetDeviceId: 'B',
    targetPortId: 'B-p1'
  });
  assert.ok(first);
  const second = connectPorts({
    devices: first.devices,
    cables: first.cables,
    selectedPort: selection,
    targetDeviceId: 'C',
    targetPortId: 'C-p1'
  });
  assert.ok(second);
  const bPort = second.devices.find(d => d.id === 'B')?.ports[0];
  assert.strictEqual(bPort?.status, 'down', 'Port B should go down after reconnection');
});

test('enforcePoEPower drops links when PoE required but peer lacks PoE', () => {
  const poeDevice = createDeviceWithModel('PoE', 'AP-POE');
  const nonPoeSwitch = createDeviceWithModel('Switch', 'NS-Switch-L3-24');
  const cable = {
    id: 'c1',
    type: 'Copper' as CableType,
    sourceDeviceId: 'PoE',
    sourcePortId: 'PoE-p1',
    targetDeviceId: 'Switch',
    targetPortId: 'Switch-p1'
  };
  const result = enforcePoEPower(
    [poeDevice, nonPoeSwitch],
    [cable]
  );
  const portPoE = result.find(d => d.id === 'PoE')?.ports[0];
  assert.strictEqual(portPoE?.status, 'down');
});
