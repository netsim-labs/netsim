
import { describe, it, expect, beforeEach } from 'vitest';
import { StpCommand } from '../../../store/slices/cli/commands/network/StpCommand';
import { createMockContext, createMockDevice } from '../../commands/testUtils';

describe('StpCommand', () => {
    let command: StpCommand;

    beforeEach(() => {
        command = new StpCommand();
    });

    it('should require system-view', () => {
        const device = createMockDevice();
        // Default is user-view
        const context = createMockContext(device, 'stp enable');

        const validation = command.validate(context);
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('system-view');
    });

    it('should enable stp', () => {
        const device = createMockDevice();
        device.cliState.view = 'system-view';
        const context = createMockContext(device, 'stp enable');

        command.execute(context);
        expect(device.stpEnabled).toBe(true);
    });

    it('should disable stp', () => {
        const device = createMockDevice();
        device.cliState.view = 'system-view';
        device.stpEnabled = true;
        const context = createMockContext(device, 'stp disable');

        command.execute(context);
        expect(device.stpEnabled).toBe(false);
    });

    it('should set stp mode', () => {
        const device = createMockDevice();
        device.cliState.view = 'system-view';

        // Test RSTP
        let context = createMockContext(device, 'stp mode rstp');
        command.execute(context);
        expect(device.stpMode).toBe('rstp');

        // Test MSTP
        context = createMockContext(device, 'stp mode mstp');
        command.execute(context);
        expect(device.stpMode).toBe('mstp');
    });

    it('should validate invalid stp mode', () => {
        const device = createMockDevice();
        device.cliState.view = 'system-view';
        const context = createMockContext(device, 'stp mode invalid');

        const validation = command.validate(context);
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('usage stp mode');
    });

    it('should set root primary', () => {
        const device = createMockDevice();
        device.cliState.view = 'system-view';
        const context = createMockContext(device, 'stp root primary');

        command.execute(context);
        expect(device.stpPriority).toBe(0);
    });

    it('should set root secondary', () => {
        const device = createMockDevice();
        device.cliState.view = 'system-view';
        const context = createMockContext(device, 'stp root secondary');

        command.execute(context);
        expect(device.stpPriority).toBe(4096);
    });
});
