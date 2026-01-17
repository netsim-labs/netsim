
import { describe, it, expect, beforeEach } from 'vitest';
import {
    ArubaRouterOspfCommand,
    ArubaOspfNetworkCommand,
    ArubaOspfRouterIdCommand
} from '../../../store/slices/cli/commands/system/ArubaOspfCommand';
import { createMockArubaDevice, createMockArubaContext } from '../testUtils';

describe('ArubaRouterOspfCommand', () => {
    let command: ArubaRouterOspfCommand;

    beforeEach(() => {
        command = new ArubaRouterOspfCommand();
    });

    describe('canHandle', () => {
        it('should handle router ospf command', () => {
            const device = createMockArubaDevice();
            const context = createMockArubaContext(device, 'router ospf 1');

            expect(command.canHandle(context)).toBe(true);
        });

        it('should not handle on non-Aruba devices', () => {
            const device = createMockArubaDevice();
            const context = createMockArubaContext(device, 'router ospf 1');
            context.profile.id = 'huawei';

            expect(command.canHandle(context)).toBe(false);
        });
    });

    describe('validate', () => {
        it('should require system-view', () => {
            const device = createMockArubaDevice();
            const context = createMockArubaContext(device, 'router ospf 1');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
        });

        it('should require process ID', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            const context = createMockArubaContext(device, 'router ospf');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('process-id');
        });

        it('should validate process ID range', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            const context = createMockArubaContext(device, 'router ospf 99999');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('1 and 65535');
        });

        it('should pass with valid process ID', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            const context = createMockArubaContext(device, 'router ospf 1');

            const validation = command.validate(context);
            expect(validation.valid).toBe(true);
        });
    });

    describe('execute', () => {
        it('should enable OSPF', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            const context = createMockArubaContext(device, 'router ospf 1');

            command.execute(context);

            expect(device.ospfEnabled).toBe(true);
            expect(device.ospfTimers?.processId).toBe(1);
        });

        it('should initialize OSPF structures', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            const context = createMockArubaContext(device, 'router ospf 1');

            command.execute(context);

            expect(device.ospfNeighbors).toEqual([]);
            expect(device.ospfLsdb).toEqual([]);
        });
    });
});

describe('ArubaOspfNetworkCommand', () => {
    let command: ArubaOspfNetworkCommand;

    beforeEach(() => {
        command = new ArubaOspfNetworkCommand();
    });

    describe('canHandle', () => {
        it('should handle network command with area', () => {
            const device = createMockArubaDevice();
            const context = createMockArubaContext(device, 'network 10.0.0.0/24 area 0');

            expect(command.canHandle(context)).toBe(true);
        });

        it('should not handle network command without area', () => {
            const device = createMockArubaDevice();
            const context = createMockArubaContext(device, 'network 10.0.0.0/24');

            expect(command.canHandle(context)).toBe(false);
        });
    });

    describe('validate', () => {
        it('should require OSPF to be enabled', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            const context = createMockArubaContext(device, 'network 10.0.0.0/24 area 0');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('OSPF not enabled');
        });

        it('should require CIDR notation', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            device.ospfEnabled = true;
            const context = createMockArubaContext(device, 'network 10.0.0.0 area 0');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('CIDR');
        });

        it('should pass with valid arguments', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            device.ospfEnabled = true;
            const context = createMockArubaContext(device, 'network 10.0.0.0/24 area 0');

            const validation = command.validate(context);
            expect(validation.valid).toBe(true);
        });
    });

    describe('execute', () => {
        it('should add network to OSPF LSDB', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            device.ospfEnabled = true;
            const context = createMockArubaContext(device, 'network 10.0.0.0/24 area 0');

            command.execute(context);

            expect(device.ospfLsdb).toHaveLength(1);
            const entry = device.ospfLsdb[0];
            expect(entry.network).toBe('10.0.0.0');
            expect(entry.mask).toBe(24);
            expect(entry.area).toBe('0');
        });
    });
});

describe('ArubaOspfRouterIdCommand', () => {
    let command: ArubaOspfRouterIdCommand;

    beforeEach(() => {
        command = new ArubaOspfRouterIdCommand();
    });

    describe('validate', () => {
        it('should require OSPF to be enabled', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            const context = createMockArubaContext(device, 'router-id 1.1.1.1');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('OSPF not enabled');
        });

        it('should validate IP format', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            device.ospfEnabled = true;
            const context = createMockArubaContext(device, 'router-id invalid');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('Invalid IP');
        });
    });

    describe('execute', () => {
        it('should set router ID', () => {
            const device = createMockArubaDevice();
            device.cliState.view = 'system-view';
            device.ospfEnabled = true;
            const context = createMockArubaContext(device, 'router-id 1.1.1.1');

            command.execute(context);

            expect(device.routerId).toBe('1.1.1.1');
        });
    });
});
