import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { evaluateAclPath, bumpAclHits, summarizeQosTrace, traceQosPath, applyQosLimit } from '../store/slices/cli/helpers.js';
import { NetworkDevice, NetworkCable, NetworkPort } from '../types/NetworkTypes.js';

test('evaluateAclPath blocks traffic when an ACL deny rule matches and records hits', () => {
  const devices: NetworkDevice[] = [
    {
      id: 'dev-A',
      vendor: 'NetSim',
      hostname: 'DevA',
      model: 'NS-Switch-L3-24',
      macAddress: 'AA:BB:CC:DD:EE:01',
      stpPriority: 32768,
      ports: [
        {
          id: 'port-A1',
          name: 'GigabitEthernet1/0/1',
          type: 'RJ45',
          status: 'up',
          stpStatus: 'forwarding',
          stpRole: 'DESI',
          config: {
            mode: 'access',
            enabled: true
          },
          sfpModule: null,
          speed: 1000,
          connectedCableId: null
        }
      ],
      position: { x: 0, y: 0 },
      vlans: [],
      consoleLogs: [],
      cliState: { view: 'user-view' },
      dhcpEnabled: false,
      dhcpPools: [],
      routingTable: [],
      aclRules: [
        {
          id: 'rule-block',
          name: 'drop-icmp',
          interfaceId: 'port-A1',
          direction: 'out',
          action: 'deny',
          protocol: 'icmp',
          source: '10.0.0.0/24',
          destination: '10.0.1.0/24'
        }
      ]
    },
    {
      id: 'dev-B',
      vendor: 'NetSim',
      hostname: 'DevB',
      model: 'NS-Switch-L3-24',
      macAddress: 'AA:BB:CC:DD:EE:02',
      stpPriority: 32768,
      ports: [
        {
          id: 'port-B1',
          name: 'G0/1',
          type: 'RJ45',
          status: 'up',
          stpStatus: 'forwarding',
          stpRole: 'DESI',
          config: {
            mode: 'access',
            enabled: true
          },
          sfpModule: null,
          speed: 1000,
          connectedCableId: null
        }
      ],
      position: { x: 0, y: 0 },
      vlans: [],
      consoleLogs: [],
      cliState: { view: 'user-view' },
      dhcpEnabled: false,
      dhcpPools: [],
      routingTable: []
    }
  ];

  const cables: NetworkCable[] = [
    {
      id: 'cable-1',
      type: 'Copper',
      sourceDeviceId: 'dev-A',
      sourcePortId: 'port-A1',
      targetDeviceId: 'dev-B',
      targetPortId: 'port-B1'
    }
  ];

  const result = evaluateAclPath(cables.map(c => c.id), devices, cables, 'dev-A', '10.0.0.5', '10.0.1.10', 'icmp');
  assert.strictEqual(result.blocked, true);
  assert.ok(result.message.includes('ACL deny'));
  assert.strictEqual(result.hits.length, 1);
  assert.strictEqual(result.hits[0].ruleId, 'rule-block');

  const updatedDevices = bumpAclHits(devices, result.hits);
  const updatedRule = updatedDevices[0].aclRules?.find(r => r.id === 'rule-block');
  assert.strictEqual(updatedRule?.hits, 1);
});

test('summarizeQosTrace summarizes queue and limit data for each hop', () => {
  const entries = [
    { portName: 'G0/1', deviceName: 'DevA', queueName: 'high', queueWeight: 8, queueDscp: 46, limit: 200 },
    { portName: 'G0/2', deviceName: 'DevB', shape: 50, queueName: 'default', queueWeight: 4 }
  ];
  const summary = summarizeQosTrace(entries);
  assert.ok(summary?.includes('DevA'));
  assert.ok(summary?.includes('limit 200 Mbps'));
  assert.ok(summary?.includes('shape 50%'));
});

test('traceQosPath collects QoS info along the path', () => {
  const device: NetworkDevice = {
    id: 'dev-A',
    vendor: 'NetSim',
    hostname: 'DevA',
    model: 'NS-Switch-L3-24',
    macAddress: 'AA:BB:CC:DD:EE:01',
    stpPriority: 32768,
    ports: [
      {
        id: 'port-1',
        name: 'G0/1',
        type: 'RJ45',
        status: 'up',
        stpStatus: 'forwarding',
        stpRole: 'ROOT',
        config: {
          mode: 'access',
          enabled: true,
          qos: {
            limitMbps: 100,
            queues: [{ name: 'default', weight: 5, dscp: 0 }]
          }
        },
        sfpModule: null,
        speed: 1000,
        connectedCableId: null
      }
    ],
    position: { x: 0, y: 0 },
    vlans: [],
    consoleLogs: [],
    cliState: { view: 'user-view' },
    dhcpEnabled: false,
    dhcpPools: [],
    routingTable: []
  };
  const devices: NetworkDevice[] = [device];
  const cables: NetworkCable[] = [
    {
      id: 'cable-1',
      type: 'Copper',
      sourceDeviceId: 'dev-A',
      sourcePortId: 'port-1',
      targetDeviceId: 'dev-A',
      targetPortId: 'port-1'
    }
  ];

  const trace = traceQosPath(cables.map(c => c.id), devices, cables, 'dev-A', 0);
  assert.strictEqual(trace[0]?.portName, 'G0/1');
  assert.strictEqual(trace[0]?.deviceName, 'DevA');
});

test('applyQosLimit blocks when limit is exceeded within the same second', () => {
  const port: NetworkPort = {
    id: 'p1',
    name: 'G0/1',
    type: 'RJ45',
    status: 'up',
    stpStatus: 'forwarding',
    stpRole: 'ROOT',
    config: {
      mode: 'access',
      enabled: true,
      qos: {
        limitMbps: 0.001 // ~125 bytes
      }
    },
    sfpModule: null,
    speed: 1000,
    connectedCableId: null
  };
  const now = Date.now();
  const result1 = applyQosLimit(port, 64, now);
  assert.strictEqual(result1.blocked, false);
  assert.ok(port.config.qosUsage);
  const result2 = applyQosLimit(port, 64, now);
  assert.strictEqual(result2.blocked, true);
  assert.ok(result2.reason?.includes('QoS policing'));
});
