
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IpCommand } from '../../../store/slices/cli/commands/pc/IpCommand';
import { createMockContext, createMockDevice } from '../testUtils';
import { NetworkDevice, DhcpPool } from '../../../types/NetworkTypes';

vi.mock('../../../store/slices/cli/validators/index', () => ({
    validateArgumentCount: vi.fn((args, min, max) => ({ valid: true })),
    validateIpAddress: vi.fn(() => ({ valid: true })),
    validateSubnetMask: vi.fn(() => ({ valid: true }))
}));

describe('IpCommand', () => {
    let command: IpCommand;
    let device: NetworkDevice;

    beforeEach(() => {
        command = new IpCommand();
        device = createMockDevice({ vendor: 'PC', model: 'PC' });
    });

    it('should handle "ip show"', () => {
        const context = createMockContext(device, 'ip show');
        device.ports[0].config.ipAddress = '10.0.0.1';
        device.ports[0].config.subnetMask = 24;

        const result = command.execute(context);
        expect(result.output[0]).toContain('eth0: 10.0.0.1/24');
    });

    it('should handle "ip set <ip> <mask>"', () => {
        const context = createMockContext(device, 'ip set 192.168.1.100 24');
        // Mock utils.getNetworkAddress
        context.utils.getNetworkAddress = vi.fn().mockReturnValue('192.168.1.0');

        const result = command.execute(context);

        expect(result.output[0]).toContain('IP set to 192.168.1.100/24');
        expect(device.ports[0].config.ipAddress).toBe('192.168.1.100');
        expect(device.ports[0].config.subnetMask).toBe(24);

        // Check routing table update
        expect(device.routingTable).toHaveLength(1);
        expect(device.routingTable[0].destination).toBe('192.168.1.0');
        expect(device.routingTable[0].interface).toBe('Ethernet0/0/1');
    });

    it('should handle "ip dhcp" success', () => {
        const server = createMockDevice({ id: 'server', dhcpEnabled: true });
        server.dhcpPools = [{
            name: 'pool1',
            network: '192.168.1.0',
            mask: 24,
            gateway: '192.168.1.1',
            dns: '8.8.8.8',
            usedIps: [],
            leases: []
        } as DhcpPool];

        const context = createMockContext(device, 'ip dhcp', [device, server]);
        // Connect devices
        context.cables = [{
            id: 'c1', type: 'Copper',
            sourceDeviceId: device.id, sourcePortId: 'p1',
            targetDeviceId: server.id, targetPortId: 'p2'
        }];

        // Mock getNextIp
        context.utils.getNextIp = vi.fn().mockReturnValue('192.168.1.100');
        context.utils.getNetworkAddress = vi.fn().mockReturnValue('192.168.1.0');

        const result = command.execute(context);

        expect(result.output[0]).toContain('DHCP ACK: 192.168.1.100/24');
        expect(device.ports[0].config.ipAddress).toBe('192.168.1.100');
    });

    it('should handle "ip dhcp" no link', () => {
        const context = createMockContext(device, 'ip dhcp');
        const result = command.execute(context);
        expect(result.output[0]).toContain('Error: No link');
    });
});
