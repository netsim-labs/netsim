
import { describe, it, expect, beforeEach } from 'vitest';
import { IpAddressCommand } from '../../../store/slices/cli/commands/interface/IpAddressCommand';
import { createMockContext, createMockDevice } from '../testUtils';

describe('IpAddressCommand', () => {
    let command: IpAddressCommand;

    beforeEach(() => {
        command = new IpAddressCommand();
    });

    it('should require interface-view', () => {
        const device = createMockDevice();
        // Default is user-view
        const context = createMockContext(device, 'ip address 192.168.1.1 24');

        const validation = command.validate(context);
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('interface-view');
    });

    it('should validate missing arguments', () => {
        const device = createMockDevice();
        device.cliState.view = 'interface-view';
        const context = createMockContext(device, 'ip address');

        const validation = command.validate(context);
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('ip address <ip> <mask>');
    });

    it('should set ip address with CIDR mask on port', () => {
        const device = createMockDevice();
        device.cliState.view = 'interface-view';
        device.cliState.currentInterfaceId = 'port-1'; // Default port

        const context = createMockContext(device, 'ip address 10.0.0.1 24');
        command.execute(context);

        const port = device.ports[0];
        expect(port.config.ipAddress).toBe('10.0.0.1');
        expect(port.config.subnetMask).toBe(24);

        // Verify routing table update
        expect(device.routingTable).toBeDefined();
        // Utils mock getNetworkAddress returns "ip/mask" string
        // Implementation: utils.getNetworkAddress(ip, mask)
        // Mock: (10.0.0.1, 24) -> "10.0.0.1/24" (based on testUtils)
        const route = device.routingTable?.find(r => r.interface === port.name);
        expect(route).toBeDefined();
        expect(route?.destination).toBe('10.0.0.1/24');
    });

    it('should set ip address with dotted decimal mask', () => {
        const device = createMockDevice();
        device.cliState.view = 'interface-view';
        device.cliState.currentInterfaceId = 'port-1';

        const context = createMockContext(device, 'ip address 192.168.1.1 255.255.255.0');
        command.execute(context);

        const port = device.ports[0];
        expect(port.config.ipAddress).toBe('192.168.1.1');
        expect(port.config.subnetMask).toBe(24);
    });

    it('should set ip address on vlanif', () => {
        const device = createMockDevice();
        device.cliState.view = 'interface-view';
        device.vlanifs = [{ id: 'vlanif10', vlanId: 10, enabled: true }];
        device.cliState.currentInterfaceId = 'vlanif10';

        const context = createMockContext(device, 'ip address 1.1.1.1 32');
        command.execute(context);

        const vlanif = device.vlanifs[0];
        expect(vlanif.ipAddress).toBe('1.1.1.1');
        expect(vlanif.subnetMask).toBe(32);
    });
});
