/**
 * PingCommand tests
 */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { PingCommand } from '../store/slices/cli/commands/pc/PingCommand.js';
import { CommandContext } from '../store/slices/cli/commands/base/Command.js';
import { NetworkDevice, NetworkCable } from '../types/NetworkTypes.js';
import { getVendorProfile } from '../utils/cliProfiles.js';

const pingCommand = new PingCommand();

// Mock PC
const mockPc: NetworkDevice = {
  id: 'pc1',
  vendor: 'PC',
  model: 'PC',
  hostname: 'PC1',
  macAddress: '00:00:00:00:00:01',
  position: { x: 0, y: 0 },
  ports: [
    {
      id: 'port1',
      name: 'eth0',
      type: 'RJ45',
      status: 'up',
      config: {
        ipAddress: '192.168.1.10',
        subnetMask: 24,
        vlan: 1,
        mode: 'access',
        enabled: true
      }
    }
  ],
  cliState: {
    view: 'user-view'
  },
  consoleLogs: [],
  vlans: [1],
  routingTable: []
} as NetworkDevice;

// Mock Router (using PC model since test is for PC ping command)
const mockRouter: NetworkDevice = {
  id: 'router1',
  vendor: 'Huawei',
  model: 'Huawei-S5700-24',
  hostname: 'R1',
  macAddress: '00:00:00:00:00:02',
  position: { x: 100, y: 0 },
  ports: [
    {
      id: 'port2',
      name: 'GE0/0/1',
      type: 'RJ45',
      status: 'up',
      config: {
        ipAddress: '192.168.1.1',
        subnetMask: 24,
        vlan: 1,
        mode: 'access',
        enabled: true
      }
    }
  ],
  cliState: {
    view: 'user-view'
  },
  consoleLogs: [],
  vlans: [1],
  routingTable: []
} as NetworkDevice;

// Mock Cable
const mockCable: NetworkCable = {
  id: 'cable1',
  sourceDeviceId: 'pc1',
  sourcePortId: 'port1',
  targetDeviceId: 'router1',
  targetPortId: 'port2'
} as NetworkCable;

test('PingCommand should handle ping command', () => {
  const context = createMockContext(['ping', '192.168.1.1']);
  assert.strictEqual(pingCommand.canHandle(context), true);
});

test('PingCommand should not handle non-PC devices', () => {
  const context = createMockContext(['ping', '192.168.1.1'], mockRouter);
  assert.strictEqual(pingCommand.canHandle(context), false);
});

test('PingCommand should validate IP address format', () => {
  const context = createMockContext(['ping', 'invalid-ip']);
  const validation = pingCommand.validate(context);
  assert.strictEqual(validation.valid, false);
  assert.ok(validation.error?.includes('Invalid target IP'));
});

test('PingCommand should require at least 2 arguments', () => {
  const context = createMockContext(['ping']);
  const validation = pingCommand.validate(context);
  assert.strictEqual(validation.valid, false);
});

test('PingCommand should execute ping successfully when target is reachable', () => {
  const context = createMockContext(['ping', '192.168.1.1']);
  const result = pingCommand.execute(context);

  assert.ok(result.output);
  assert.ok(result.output.some((line: string) => line.includes('PING 192.168.1.1')));
  assert.ok(result.output.some((line: string) => line.includes('Reply from')));
  assert.ok(result.output.some((line: string) => line.includes('ping statistics')));
});

test('PingCommand should report unreachable when target does not exist', () => {
  const context = createMockContext(['ping', '10.0.0.1']);
  const result = pingCommand.execute(context);

  assert.ok(result.output);
  assert.ok(result.output.some((line: string) => line.includes('unreachable')));
});

test('PingCommand should include QoS information in output when present', () => {
  const context = createMockContext(['ping', '192.168.1.1'], mockPc);
  const result = pingCommand.execute(context);

  // QoS delay should be reflected in the ping time
  assert.ok(result.output);
  assert.ok(result.output.some((line: string) => line.includes('time=')));
});

// Helper function to create mock context
function createMockContext(args: string[], device: NetworkDevice = mockPc): CommandContext {
  const profile = getVendorProfile(device.vendor, device.model);

  return {
    device,
    devices: [mockPc, mockRouter],
    cables: [mockCable],
    profile,
    rawInput: args.join(' '),
    normalizedCommand: args.join(' '),
    args,
    cloneDevice: (id: string) => {
      if (id === 'pc1') return mockPc;
      if (id === 'router1') return mockRouter;
      return undefined;
    },
    highlightTraffic: () => {},
    utils: {
      getNetworkAddress: () => '192.168.1.0',
      getNextIp: () => null,
      findPath: (src: string, dst: string) => {
        if (src === 'pc1' && dst === 'router1') {
          return ['pc1', 'cable1', 'router1'];
        }
        return null;
      },
      recomputeOspf: () => {},
      generateUUID: () => 'test-uuid'
    }
  };
}
