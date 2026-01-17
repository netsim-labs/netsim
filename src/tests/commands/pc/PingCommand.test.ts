
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PingCommand } from '../../../store/slices/cli/commands/pc/PingCommand';
import { createMockContext, createMockDevice } from '../testUtils';
import { NetworkDevice } from '../../../types/NetworkTypes';

// Mock dependencies
vi.mock('../../../store/slices/cli/helpers', () => ({
    traceQosPath: vi.fn(),
    computeQosDelay: vi.fn(() => 5),
    summarizeQosTrace: vi.fn(() => ''),

}));

vi.mock('../../../store/slices/cli/validators/index', () => ({
    validateArgumentCount: vi.fn((args, min, max) => ({ valid: true })), // Simplified for main test
    validateIpAddress: vi.fn((ip) => ({ valid: true }))
}));

describe('PingCommand', () => {
    let command: PingCommand;
    let sourceDevice: NetworkDevice;
    let targetDevice: NetworkDevice;

    beforeEach(() => {
        command = new PingCommand();
        sourceDevice = createMockDevice({ id: 'pc1', vendor: 'PC', model: 'PC' });
        sourceDevice.ports[0].config.ipAddress = '192.168.1.2';

        targetDevice = createMockDevice({ id: 'pc2', vendor: 'PC', model: 'PC' });
        targetDevice.ports[0].config.ipAddress = '192.168.1.3';
    });

    it('should only handle PC devices', () => {
        const pcContext = createMockContext(sourceDevice, 'ping 1.1.1.1');
        expect(command.canHandle(pcContext)).toBe(true);

        const routerDevice = createMockDevice({ vendor: 'Huawei', model: 'Router-AR2200' });
        const routerContext = createMockContext(routerDevice, 'ping 1.1.1.1');
        expect(command.canHandle(routerContext)).toBe(false);
    });

    it('should return error if target unreachable (no route)', () => {
        const context = createMockContext(sourceDevice, 'ping 192.168.1.3', [sourceDevice, targetDevice]);
        // Mock utils.findPath to return null
        context.utils.findPath = vi.fn().mockReturnValue(null);

        const result = command.execute(context);
        expect(result.output[1]).toContain('Request time out');
    });

    it('should survive if target does not exist', () => {
        const context = createMockContext(sourceDevice, 'ping 10.0.0.99', [sourceDevice]);
        const result = command.execute(context);
        expect(result.output[1]).toContain('Host unreachable');
    });

    it('should successfully ping reachable target', () => {
        const context = createMockContext(sourceDevice, 'ping 192.168.1.3', [sourceDevice, targetDevice]);

        // Mock path finding success
        context.utils.findPath = vi.fn().mockReturnValue(['cable-1']);

        const result = command.execute(context);

        expect(result.output.length).toBeGreaterThan(2);
        expect(result.output[0]).toContain('PING 192.168.1.3');
        expect(result.output[1]).toContain('Reply from 192.168.1.3');

        // Check highlight traffic was called
        expect(context.highlightTraffic).toHaveBeenCalled();
    });
});
