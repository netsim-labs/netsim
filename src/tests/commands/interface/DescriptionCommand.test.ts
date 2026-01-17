
import { describe, it, expect, beforeEach } from 'vitest';
import { DescriptionCommand } from '../../../store/slices/cli/commands/interface/DescriptionCommand';
import { createMockContext, createMockDevice } from '../testUtils';

describe('DescriptionCommand', () => {
    let command: DescriptionCommand;

    beforeEach(() => {
        command = new DescriptionCommand();
    });

    it('should require interface-view', () => {
        const device = createMockDevice();
        // Default is user-view
        const context = createMockContext(device, 'description test');

        const validation = command.validate(context);
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('interface-view');
    });

    it('should validate missing description', () => {
        const device = createMockDevice();
        device.cliState.view = 'interface-view';
        const context = createMockContext(device, 'description');

        const validation = command.validate(context);
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('description <text>');
    });

    it('should set description on port', () => {
        const device = createMockDevice();
        device.cliState.view = 'interface-view';
        device.cliState.currentInterfaceId = 'port-1'; // Default port

        const context = createMockContext(device, 'description Link to Router');
        command.execute(context);

        const port = device.ports[0];
        expect(port.config.description).toBe('Link to Router');
    });

    it('should set description on vlanif', () => {
        const device = createMockDevice();
        device.cliState.view = 'interface-view';
        device.vlanifs = [{ id: 'vlanif10', vlanId: 10, enabled: true }];
        device.cliState.currentInterfaceId = 'vlanif10';

        const context = createMockContext(device, 'description Core VLAN');
        command.execute(context);

        const vlanif = device.vlanifs[0];
        expect(vlanif.description).toBe('Core VLAN');
    });
});
