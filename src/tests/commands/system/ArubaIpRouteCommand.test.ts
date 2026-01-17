
import { describe, it, expect, beforeEach } from 'vitest';
import { ArubaIpRouteCommand, ArubaNoIpRouteCommand } from '../../../store/slices/cli/commands/system/ArubaIpRouteCommand';
import { createMockArubaDevice, createMockArubaContext } from '../testUtils';

describe('ArubaIpRouteCommand', () => {
    let command: ArubaIpRouteCommand;

    beforeEach(() => {
        command = new ArubaIpRouteCommand();
    });

    describe('canHandle', () => {
        it('should handle Aruba ip route commands', () => {
            const device = createMockArubaDevice();
            const context = createMockArubaContext(device, 'ip route 10.0.0.0/24 192.168.1.1');

            expect(command.canHandle(context)).toBe(true);
        });

        it('should not handle non-Aruba devices', () => {
            const device = createMockArubaDevice({ vendor: 'Huawei' });
            const context = createMockArubaContext(device, 'ip route 10.0.0.0/24 192.168.1.1');
            // Override profile to huawei
            context.profile.id = 'huawei';

            expect(command.canHandle(context)).toBe(false);
        });
    });

    describe('validate', () => {
        it('should require system-view', () => {
            const device = createMockArubaDevice();
            // Default is user-view
            const context = createMockArubaContext(device, 'ip route 10.0.0.0/24 192.168.1.1');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('system-view');
        });

        it('should require CIDR notation', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            const context = createMockArubaContext(device, 'ip route 10.0.0.0 192.168.1.1');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('CIDR');
        });

        it('should validate mask range', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            const context = createMockArubaContext(device, 'ip route 10.0.0.0/33 192.168.1.1');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('Mask must be between');
        });

        it('should validate next-hop IP format', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            const context = createMockArubaContext(device, 'ip route 10.0.0.0/24 invalid-ip');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('Invalid next-hop');
        });

        it('should pass validation with correct arguments', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            const context = createMockArubaContext(device, 'ip route 10.0.0.0/24 192.168.1.1');

            const validation = command.validate(context);
            expect(validation.valid).toBe(true);
        });
    });

    describe('execute', () => {
        it('should add static route to routing table', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            const context = createMockArubaContext(device, 'ip route 10.0.0.0/24 192.168.1.1');

            const result = command.execute(context);

            expect(device.routingTable).toHaveLength(1);
            const route = device.routingTable[0];
            expect(route.destination).toBe('10.0.0.0');
            expect(route.mask).toBe(24);
            expect(route.nextHop).toBe('192.168.1.1');
            expect(route.proto).toBe('Static');
            expect(route.pre).toBe(1); // Aruba admin distance
        });

        it('should prevent duplicate routes', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            device.routingTable = [{
                destination: '10.0.0.0',
                mask: 24,
                proto: 'Static',
                pre: 1,
                cost: 0,
                nextHop: '192.168.1.1',
                interface: ''
            }];
            const context = createMockArubaContext(device, 'ip route 10.0.0.0/24 192.168.1.1');

            const result = command.execute(context);

            expect(device.routingTable).toHaveLength(1);
            expect(result.output.some(line => line.includes('already exists'))).toBe(true);
        });

        it('should add route with different mask as separate entry', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            device.routingTable = [{
                destination: '10.0.0.0',
                mask: 24,
                proto: 'Static',
                pre: 1,
                cost: 0,
                nextHop: '192.168.1.1',
                interface: ''
            }];
            const context = createMockArubaContext(device, 'ip route 10.0.0.0/16 192.168.1.1');

            command.execute(context);

            expect(device.routingTable).toHaveLength(2);
        });
    });
});

describe('ArubaNoIpRouteCommand', () => {
    let command: ArubaNoIpRouteCommand;

    beforeEach(() => {
        command = new ArubaNoIpRouteCommand();
    });

    describe('canHandle', () => {
        it('should handle no ip route commands', () => {
            const device = createMockArubaDevice();
            const context = createMockArubaContext(device, 'no ip route 10.0.0.0/24 192.168.1.1');

            expect(command.canHandle(context)).toBe(true);
        });
    });

    describe('execute', () => {
        it('should remove existing route', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            device.routingTable = [{
                destination: '10.0.0.0',
                mask: 24,
                proto: 'Static',
                pre: 1,
                cost: 0,
                nextHop: '192.168.1.1',
                interface: ''
            }];
            const context = createMockArubaContext(device, 'no ip route 10.0.0.0/24 192.168.1.1');

            command.execute(context);

            expect(device.routingTable).toHaveLength(0);
        });

        it('should report when route not found', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            device.routingTable = [];
            const context = createMockArubaContext(device, 'no ip route 10.0.0.0/24 192.168.1.1');

            const result = command.execute(context);

            expect(result.output.some(line => line.includes('not found'))).toBe(true);
        });
    });
});
