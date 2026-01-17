
import { describe, it, expect, beforeEach } from 'vitest';
import { InterfaceCommand } from '../../../store/slices/cli/commands/navigation/InterfaceCommand';
import { createMockContext, createMockDevice } from '../testUtils';

describe('InterfaceCommand', () => {
    let command: InterfaceCommand;

    beforeEach(() => {
        command = new InterfaceCommand();
    });

    it('should require system-view', () => {
        const device = createMockDevice();
        // Default is user-view
        const context = createMockContext(device, 'interface GigabitEthernet0/0/1');

        const validation = command.validate(context);
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('system-view');
    });

    it('should enter valid interface view', () => {
        const device = createMockDevice();
        device.cliState.view = 'system-view';
        const context = createMockContext(device, 'interface Ethernet0/0/1');

        const validation = command.validate(context);
        expect(validation.valid).toBe(true);

        const result = command.execute(context);
        expect(device.cliState.view).toBe('interface-view');
        expect(device.cliState.currentInterfaceId).toBe('port-1');
        expect(result.output).toEqual([]); // No output on success usually, or empty
    });

    it('should fail for non-existent interface', () => {
        const device = createMockDevice();
        device.cliState.view = 'system-view';
        const context = createMockContext(device, 'interface GigabitEthernet9/9/9');

        const result = command.execute(context);
        // It returns an error in the result, typically wrapping output
        // Looking at source: createError returns output with error message
        expect(result.output[0]).toContain('Interface not found');
        expect(device.cliState.view).toBe('system-view'); // Should not change view
    });

    it('should create and enter vlanif view', () => {
        const device = createMockDevice();
        device.cliState.view = 'system-view';
        const context = createMockContext(device, 'interface vlanif10');

        const result = command.execute(context);
        expect(device.cliState.view).toBe('interface-view');
        expect(device.cliState.currentInterfaceId).toBe('vlanif10');

        // Verify vlanif was created
        expect(device.vlanifs?.find(v => v.vlanId === 10)).toBeDefined();
    });

    it('should create and enter eth-trunk view', () => {
        const device = createMockDevice();
        device.cliState.view = 'system-view';
        const context = createMockContext(device, 'interface eth-trunk 1');

        const result = command.execute(context);
        expect(device.cliState.view).toBe('interface-view');
        expect(device.cliState.currentInterfaceId).toBe('eth-trunk1');

        // Verify eth-trunk was created
        expect(device.ethTrunks?.find(t => t.id === '1')).toBeDefined();
    });
});
