
import { describe, it, expect, beforeEach } from 'vitest';
import { IpRouteStaticCommand } from '../../../store/slices/cli/commands/system/IpRouteStaticCommand';
import { createMockContext, createMockDevice } from '../testUtils';

describe('IpRouteStaticCommand', () => {
    let command: IpRouteStaticCommand;

    beforeEach(() => {
        command = new IpRouteStaticCommand();
    });

    it('should require system-view', () => {
        const device = createMockDevice();
        // Default is user-view
        const context = createMockContext(device, 'ip route-static 192.168.2.0 24 10.0.0.1');

        const validation = command.validate(context);
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('system-view');
    });

    it('should validate missing arguments', () => {
        const device = createMockDevice();
        device.cliState.view = 'system-view';
        const context = createMockContext(device, 'ip route-static 192.168.2.0');

        const validation = command.validate(context);
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('Usage ip route-static');
    });

    it('should add static route', () => {
        const device = createMockDevice();
        device.cliState.view = 'system-view';
        const context = createMockContext(device, 'ip route-static 192.168.2.0 24 10.0.0.1');

        command.execute(context);

        expect(device.routingTable).toHaveLength(1);
        const route = device.routingTable[0];
        expect(route.destination).toBe('192.168.2.0');
        expect(route.mask).toBe(24);
        expect(route.nextHop).toBe('10.0.0.1');
        expect(route.proto).toBe('Static');
        expect(route.pre).toBe(60);
    });
});
