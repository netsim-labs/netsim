
import { describe, it, expect, beforeEach } from 'vitest';
import {
    MikroTikIpRouteAddCommand,
    MikroTikIpRoutePrintCommand,
    MikroTikIpRouteRemoveCommand
} from '../../../store/slices/cli/commands/system/MikroTikIpRouteCommand';
import { createMockMikroTikDevice, createMockMikroTikContext } from '../testUtils';

describe('MikroTikIpRouteAddCommand', () => {
    let command: MikroTikIpRouteAddCommand;

    beforeEach(() => {
        command = new MikroTikIpRouteAddCommand();
    });

    describe('canHandle', () => {
        it('should handle /ip route add commands', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip route add dst-address=10.0.0.0/24 gateway=192.168.1.1');

            expect(command.canHandle(context)).toBe(true);
        });

        it('should handle path-style commands', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip/route/add dst-address=10.0.0.0/24 gateway=192.168.1.1');

            expect(command.canHandle(context)).toBe(true);
        });

        it('should not handle non-MikroTik devices', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip route add dst-address=10.0.0.0/24 gateway=192.168.1.1');
            context.profile.id = 'huawei';

            expect(command.canHandle(context)).toBe(false);
        });
    });

    describe('validate', () => {
        it('should require dst-address parameter', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip route add gateway=192.168.1.1');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('dst-address');
        });

        it('should require gateway parameter', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip route add dst-address=10.0.0.0/24');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('gateway');
        });

        it('should accept short parameter names', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip route add dst=10.0.0.0/24 gw=192.168.1.1');

            const validation = command.validate(context);
            expect(validation.valid).toBe(true);
        });

        it('should pass with correct parameters', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip route add dst-address=10.0.0.0/24 gateway=192.168.1.1');

            const validation = command.validate(context);
            expect(validation.valid).toBe(true);
        });
    });

    describe('execute', () => {
        it('should add static route to routing table', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip route add dst-address=10.0.0.0/24 gateway=192.168.1.1');

            command.execute(context);

            expect(device.routingTable).toHaveLength(1);
            const route = device.routingTable[0];
            expect(route.destination).toBe('10.0.0.0');
            expect(route.mask).toBe(24);
            expect(route.nextHop).toBe('192.168.1.1');
            expect(route.proto).toBe('Static');
        });

        it('should use default distance of 1', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip route add dst-address=10.0.0.0/24 gateway=192.168.1.1');

            command.execute(context);

            expect(device.routingTable[0].pre).toBe(1);
        });

        it('should use custom distance when specified', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip route add dst-address=10.0.0.0/24 gateway=192.168.1.1 distance=10');

            command.execute(context);

            expect(device.routingTable[0].pre).toBe(10);
        });

        it('should prevent duplicate routes', () => {
            const device = createMockMikroTikDevice();
            device.routingTable = [{
                destination: '10.0.0.0',
                mask: 24,
                proto: 'Static',
                pre: 1,
                cost: 0,
                nextHop: '192.168.1.1',
                interface: ''
            }];
            const context = createMockMikroTikContext(device, '/ip route add dst-address=10.0.0.0/24 gateway=192.168.1.1');

            const result = command.execute(context);

            expect(device.routingTable).toHaveLength(1);
            expect(result.output.some(line => line.includes('already exists'))).toBe(true);
        });

        it('should handle host routes (no mask)', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip route add dst-address=10.0.0.1 gateway=192.168.1.1');

            command.execute(context);

            expect(device.routingTable[0].mask).toBe(32);
        });
    });
});

describe('MikroTikIpRoutePrintCommand', () => {
    let command: MikroTikIpRoutePrintCommand;

    beforeEach(() => {
        command = new MikroTikIpRoutePrintCommand();
    });

    describe('canHandle', () => {
        it('should handle /ip route print', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip route print');

            expect(command.canHandle(context)).toBe(true);
        });

        it('should handle /ip route alone', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip route');

            expect(command.canHandle(context)).toBe(true);
        });
    });

    describe('execute', () => {
        it('should display routing table header', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip route print');

            const result = command.execute(context);

            expect(result.output.some(line => line.includes('DST-ADDRESS'))).toBe(true);
            expect(result.output.some(line => line.includes('GATEWAY'))).toBe(true);
        });

        it('should display routes', () => {
            const device = createMockMikroTikDevice();
            device.routingTable = [{
                destination: '10.0.0.0',
                mask: 24,
                proto: 'Static',
                pre: 1,
                cost: 0,
                nextHop: '192.168.1.1',
                interface: ''
            }];
            const context = createMockMikroTikContext(device, '/ip route print');

            const result = command.execute(context);

            expect(result.output.some(line => line.includes('10.0.0.0/24'))).toBe(true);
            expect(result.output.some(line => line.includes('192.168.1.1'))).toBe(true);
        });

        it('should show no routes message when empty', () => {
            const device = createMockMikroTikDevice();
            device.routingTable = [];
            const context = createMockMikroTikContext(device, '/ip route print');

            const result = command.execute(context);

            expect(result.output.some(line => line.includes('no routes'))).toBe(true);
        });
    });
});

describe('MikroTikIpRouteRemoveCommand', () => {
    let command: MikroTikIpRouteRemoveCommand;

    beforeEach(() => {
        command = new MikroTikIpRouteRemoveCommand();
    });

    describe('canHandle', () => {
        it('should handle /ip route remove', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip route remove numbers=0');

            expect(command.canHandle(context)).toBe(true);
        });
    });

    describe('validate', () => {
        it('should require route number', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip route remove');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
        });

        it('should accept positional route number', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/ip route remove 0');

            const validation = command.validate(context);
            expect(validation.valid).toBe(true);
        });
    });

    describe('execute', () => {
        it('should remove route by number', () => {
            const device = createMockMikroTikDevice();
            device.routingTable = [{
                destination: '10.0.0.0',
                mask: 24,
                proto: 'Static',
                pre: 1,
                cost: 0,
                nextHop: '192.168.1.1',
                interface: ''
            }];
            const context = createMockMikroTikContext(device, '/ip route remove numbers=0');

            command.execute(context);

            expect(device.routingTable).toHaveLength(0);
        });

        it('should report error for non-existent route', () => {
            const device = createMockMikroTikDevice();
            device.routingTable = [];
            const context = createMockMikroTikContext(device, '/ip route remove numbers=0');

            const result = command.execute(context);

            expect(result.output.some(line => line.includes('no such item'))).toBe(true);
        });

        it('should not remove non-static routes', () => {
            const device = createMockMikroTikDevice();
            device.routingTable = [{
                destination: '10.0.0.0',
                mask: 24,
                proto: 'Direct',
                pre: 0,
                cost: 0,
                nextHop: '',
                interface: 'ether1'
            }];
            const context = createMockMikroTikContext(device, '/ip route remove numbers=0');

            const result = command.execute(context);

            expect(result.output.some(line => line.includes('cannot remove non-static'))).toBe(true);
            expect(device.routingTable).toHaveLength(1);
        });
    });
});
