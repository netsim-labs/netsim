
import { describe, it, expect, beforeEach } from 'vitest';
import { ShutdownCommand } from '../../../store/slices/cli/commands/interface/ShutdownCommand';
import { createMockContext, createMockDevice } from '../testUtils';

describe('ShutdownCommand', () => {
    let command: ShutdownCommand;

    beforeEach(() => {
        command = new ShutdownCommand();
    });

    it('should require interface-view', () => {
        const device = createMockDevice();
        // Default is user-view
        const context = createMockContext(device, 'shutdown');

        const validation = command.validate(context);
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('interface-view');
    });

    it('should shutdown a port', () => {
        const device = createMockDevice();
        // Setup interface view
        device.cliState.view = 'interface-view';
        device.cliState.currentInterfaceId = 'port-1'; // Default port ID in mock

        const context = createMockContext(device, 'shutdown');

        const result = command.execute(context);
        const port = device.ports.find(p => p.id === 'port-1');

        expect(port?.config.enabled).toBe(false);
        expect(port?.status).toBe('down');
    });

    it('should undo shutdown a port', () => {
        const device = createMockDevice();
        device.cliState.view = 'interface-view';
        device.cliState.currentInterfaceId = 'port-1';
        // Start disabled
        device.ports[0].config.enabled = false;
        device.ports[0].status = 'down';

        const context = createMockContext(device, 'undo shutdown');

        const result = command.execute(context);
        const port = device.ports.find(p => p.id === 'port-1');

        expect(port?.config.enabled).toBe(true);
        // Status typically becomes 'up' if cable connected (mock default no cable? NO, check mock)
        // createMockDevice() -> ports[0] has no connectedCableId by default unless overridden?
        // Let's check logic: isUndo ? (connectedCableId ? 'up' : 'down') : 'down'
        // Mock default port has no cable. So likely 'down' physically but enabled logically.
        expect(port?.config.enabled).toBe(true);
    });

    it('should shutdown vlanif', () => {
        const device = createMockDevice();
        device.cliState.view = 'interface-view';
        device.cliState.currentInterfaceId = 'vlanif10';
        device.vlanifs = [{ id: 'vlanif10', vlanId: 10, enabled: true }];

        const context = createMockContext(device, 'shutdown');
        command.execute(context);

        expect(device.vlanifs[0].enabled).toBe(false);
    });

    it('should undo shutdown vlanif', () => {
        const device = createMockDevice();
        device.cliState.view = 'interface-view';
        device.cliState.currentInterfaceId = 'vlanif10';
        device.vlanifs = [{ id: 'vlanif10', vlanId: 10, enabled: false }];

        const context = createMockContext(device, 'undo shutdown');
        command.execute(context);

        expect(device.vlanifs[0].enabled).toBe(true);
    });
});
