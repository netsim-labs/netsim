import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { nextDhcpIp, vrrpSelectMaster, poePowerOk } from '../utils/testables.js';

test('DHCP next IP skips gateway, excluded and used', () => {
  const ip = nextDhcpIp('192.168.10.0', 24, ['192.168.10.2', '192.168.10.3'], '192.168.10.1', ['192.168.10.4']);
  assert.strictEqual(ip, '192.168.10.5');
});

test('DHCP returns null when pool exhausted', () => {
  const used = Array.from({ length: 252 }, (_, i) => `192.168.10.${i + 2}`);
  const ip = nextDhcpIp('192.168.10.0', 24, used, '192.168.10.1', []);
  assert.strictEqual(ip, null);
});

test('VRRP elects by priority then routerId', () => {
  const master = vrrpSelectMaster([
    { deviceId: 'B', priority: 110, routerId: '1.1.1.2' },
    { deviceId: 'A', priority: 120, routerId: '1.1.1.1' },
    { deviceId: 'C', priority: 120, routerId: '1.1.1.0' }
  ]);
  assert.strictEqual(master, 'C'); // empate de prioridad, routerId menor gana
});

test('PoE logic powers AP/VoIP only when peer is PoE switch', () => {
  assert.strictEqual(poePowerOk('AP-POE', 'NS-Switch-L3-24-POE'), true);
  assert.strictEqual(poePowerOk('AP-POE', 'NS-Switch-L3-24'), false);
  assert.strictEqual(poePowerOk('PC', 'NS-Switch-L3-24'), true);
});
