
import { describe, it, expect, beforeEach } from 'vitest';
import { DhcpEnableCommand } from '../../../store/slices/cli/commands/system/DhcpEnableCommand';
import { createMockContext, createMockDevice } from '../testUtils';

describe('DhcpEnableCommand', () => {
    let command: DhcpEnableCommand;

    beforeEach(() => {
        command = new DhcpEnableCommand();
    });

    it('should require system-view', () => {
        const device = createMockDevice();
        // Default is user-view
        const context = createMockContext(device, 'dhcp enable');

        const validation = command.validate(context);
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('system-view');
    });

    it('should enable dhcp', () => {
        const device = createMockDevice();
        device.cliState.view = 'system-view';
        const context = createMockContext(device, 'dhcp enable');

        command.execute(context);
        expect(device.dhcpEnabled).toBe(true);
        // Also initializes pools array
        expect(device.dhcpPools).toBeDefined();
    });
});
