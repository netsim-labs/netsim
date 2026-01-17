
import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { TopologyAnalyzer } from '../features/ai/agents/troubleshooting/TopologyAnalyzer.js';
import { NetworkDevice, NetworkCable, NetworkPort } from '../types/NetworkTypes.js';

// Helper to create mock device
const createDevice = (id: string, name: string, ip?: string, mask?: number, enabled = true, vlan = 1, mode: 'access' | 'trunk' = 'access'): NetworkDevice => {
    return {
        id,
        hostname: name,
        vendor: 'Huawei',
        model: 'Huawei-S5700-28TP',
        ports: [
            {
                id: `${id}-p1`,
                name: 'GE0/0/1',
                type: 'RJ45',
                status: 'up',
                config: {
                    mode,
                    vlan,
                    enabled,
                    ipAddress: ip,
                    subnetMask: mask
                }
            } as NetworkPort
        ],
        position: { x: 0, y: 0 },
        vlans: [1],
        consoleLogs: [],
        cliState: { view: 'user-view' }
    } as any;
};

// Helper to create cable
const createCable = (dev1: string, dev2: string): NetworkCable => ({
    id: `cable-${dev1}-${dev2}`,
    type: 'Copper',
    sourceDeviceId: dev1,
    sourcePortId: `${dev1}-p1`,
    targetDeviceId: dev2,
    targetPortId: `${dev2}-p1`
});

describe('TopologyAnalyzer', () => {

    it('detects duplicate IPs', () => {
        const d1 = createDevice('d1', 'R1', '192.168.1.1', 24);
        const d2 = createDevice('d2', 'R2', '192.168.1.1', 24); // Same IP

        const issues = TopologyAnalyzer.analyze([d1, d2], []);

        // Assert we have a duplicate IP issue
        const dupIssue = issues.find(i => i.id.startsWith('dup-ip'));
        assert.ok(dupIssue, 'Should detect duplicate IP');
        assert.strictEqual(dupIssue?.affectedDevices.length, 2);
    });

    it('detects subnet mismatch', () => {
        const d1 = createDevice('d1', 'R1', '192.168.1.1', 24);
        const d2 = createDevice('d2', 'R2', '192.168.2.1', 24); // Different subnet (1.0 vs 2.0)
        const cable = createCable('d1', 'd2');

        const issues = TopologyAnalyzer.analyze([d1, d2], [cable]);

        const mismatch = issues.find(i => i.category === 'L3' && i.title === 'Subnet Mismatch');
        assert.ok(mismatch, 'Should detect subnet mismatch');
    });

    it('detects administrative shutdown', () => {
        const d1 = createDevice('d1', 'SW1', undefined, undefined, true);
        const d2 = createDevice('d2', 'SW2', undefined, undefined, false); // Disabled
        const cable = createCable('d1', 'd2');

        const issues = TopologyAnalyzer.analyze([d1, d2], [cable]);

        const shutdown = issues.find(i => i.title === 'Interface Administratively Down');
        assert.ok(shutdown, 'Should detect shutdown interface');
        assert.strictEqual(shutdown?.affectedDevices[0], 'SW2');
    });

    it('detects VLAN mismatch (Access)', () => {
        const d1 = createDevice('d1', 'SW1', undefined, undefined, true, 10, 'access');
        const d2 = createDevice('d2', 'SW2', undefined, undefined, true, 20, 'access'); // Different VLAN
        const cable = createCable('d1', 'd2');

        const issues = TopologyAnalyzer.analyze([d1, d2], [cable]);

        const mismatch = issues.find(i => i.title === 'Access VLAN Mismatch');
        assert.ok(mismatch, 'Should detect access VLAN mismatch');
    });

    it('detects Port Mode mismatch', () => {
        const d1 = createDevice('d1', 'SW1', undefined, undefined, true, 1, 'trunk');
        const d2 = createDevice('d2', 'SW2', undefined, undefined, true, 1, 'access'); // Different mode
        const cable = createCable('d1', 'd2');

        const issues = TopologyAnalyzer.analyze([d1, d2], [cable]);

        const mismatch = issues.find(i => i.title === 'Port Mode Mismatch');
        assert.ok(mismatch, 'Should detect mode mismatch');
    });

    it('passes cleanly for correct configuration', () => {
        const d1 = createDevice('d1', 'R1', '10.0.0.1', 30);
        const d2 = createDevice('d2', 'R2', '10.0.0.2', 30);
        const cable = createCable('d1', 'd2');

        const issues = TopologyAnalyzer.analyze([d1, d2], [cable]);

        assert.strictEqual(issues.length, 0, 'Should have no issues for correct L3 link');
    });

});
