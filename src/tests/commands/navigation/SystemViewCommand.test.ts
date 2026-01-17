
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SystemViewCommand, ReturnCommand } from '../../../store/slices/cli/commands/navigation/SystemViewCommand';
import { createMockContext, createMockDevice } from '../testUtils';
import { NetworkDevice } from '../../../types/NetworkTypes';

describe('SystemViewCommand', () => {
    let command: SystemViewCommand;
    let device: NetworkDevice;

    beforeEach(() => {
        command = new SystemViewCommand();
        device = createMockDevice({ vendor: 'Huawei', cliState: { view: 'user-view' } });
    });

    it('should enter system-view', () => {
        const context = createMockContext(device, 'system-view');
        const result = command.execute(context);
        expect(device.cliState.view).toBe('system-view');
        expect(result.output[1]).toContain('simulado');
    });

    it('should handle "sys" alias', () => {
        const context = createMockContext(device, 'sys');
        expect(command.canHandle(context)).toBe(true);
    });
});

describe('ReturnCommand', () => {
    let command: ReturnCommand;
    let device: NetworkDevice;

    beforeEach(() => {
        command = new ReturnCommand();
        device = createMockDevice({ vendor: 'Huawei', cliState: { view: 'system-view' } });
    });

    it('should return to user-view', () => {
        const context = createMockContext(device, 'return');
        command.execute(context);
        expect(device.cliState.view).toBe('user-view');
    });

    it('should clear current interface/pool', () => {
        device.cliState.currentInterfaceId = 'if1';
        device.cliState.currentPoolName = 'pool1';
        const context = createMockContext(device, 'return');
        command.execute(context);

        expect(device.cliState.currentInterfaceId).toBeUndefined();
        expect(device.cliState.currentPoolName).toBeUndefined();
    });
});
