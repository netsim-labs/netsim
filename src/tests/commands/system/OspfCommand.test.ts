
import { describe, it, expect, beforeEach } from 'vitest';
import { OspfEnableCommand, OspfTimerCommand } from '../../../store/slices/cli/commands/system/OspfCommand';
import { createMockContext, createMockDevice } from '../testUtils';

describe('OspfEnableCommand', () => {
    let command: OspfEnableCommand;

    beforeEach(() => {
        command = new OspfEnableCommand();
    });

    it('should require system-view', () => {
        const device = createMockDevice();
        // Default is user-view
        const context = createMockContext(device, 'ospf enable');

        const validation = command.validate(context);
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('system-view');
    });

    it('should enable ospf', () => {
        const device = createMockDevice();
        device.cliState.view = 'system-view';
        const context = createMockContext(device, 'ospf enable');

        command.execute(context);
        expect(device.ospfEnabled).toBe(true);
    });
});

describe('OspfTimerCommand', () => {
    let command: OspfTimerCommand;

    beforeEach(() => {
        command = new OspfTimerCommand();
    });

    it('should require system-view', () => {
        const device = createMockDevice();
        const context = createMockContext(device, 'ospf timer hello 10 dead 40');

        const validation = command.validate(context);
        expect(validation.valid).toBe(false);
    });

    it('should set ospf timers', () => {
        const device = createMockDevice();
        device.cliState.view = 'system-view';
        const context = createMockContext(device, 'ospf timer hello 10 dead 40');

        command.execute(context);
        expect(device.ospfTimers).toEqual({ hello: 10, dead: 40 });
    });

    it('should validate invalid timers', () => {
        const device = createMockDevice();
        device.cliState.view = 'system-view';
        // dead <= hello
        const context = createMockContext(device, 'ospf timer hello 10 dead 10');

        const validation = command.validate(context);
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('Dead must be > hello');
    });
});
