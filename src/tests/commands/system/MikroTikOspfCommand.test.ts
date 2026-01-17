
import { describe, it, expect, beforeEach } from 'vitest';
import {
    MikroTikOspfInstanceAddCommand,
    MikroTikOspfNetworkAddCommand,
    MikroTikOspfInstancePrintCommand,
    MikroTikOspfNeighborPrintCommand,
    MikroTikOspfInterfaceAddCommand
} from '../../../store/slices/cli/commands/system/MikroTikOspfCommand';
import { createMockMikroTikDevice, createMockMikroTikContext } from '../testUtils';

describe('MikroTikOspfInstanceAddCommand', () => {
    let command: MikroTikOspfInstanceAddCommand;

    beforeEach(() => {
        command = new MikroTikOspfInstanceAddCommand();
    });

    describe('canHandle', () => {
        it('should handle /routing ospf instance add', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing ospf instance add name=default router-id=1.1.1.1');

            expect(command.canHandle(context)).toBe(true);
        });

        it('should handle path-style syntax', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing/ospf/instance/add router-id=1.1.1.1');

            expect(command.canHandle(context)).toBe(true);
        });

        it('should not handle non-MikroTik devices', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing ospf instance add router-id=1.1.1.1');
            context.profile.id = 'huawei';

            expect(command.canHandle(context)).toBe(false);
        });
    });

    describe('validate', () => {
        it('should require router-id', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing ospf instance add name=default');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('router-id');
        });

        it('should pass with router-id', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing ospf instance add router-id=1.1.1.1');

            const validation = command.validate(context);
            expect(validation.valid).toBe(true);
        });
    });

    describe('execute', () => {
        it('should enable OSPF', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing ospf instance add router-id=1.1.1.1');

            command.execute(context);

            expect(device.ospfEnabled).toBe(true);
        });

        it('should set router ID', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing ospf instance add router-id=1.1.1.1');

            command.execute(context);

            expect(device.routerId).toBe('1.1.1.1');
        });

        it('should use instance name if provided', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing ospf instance add name=my-ospf router-id=1.1.1.1');

            command.execute(context);

            expect(device.ospfTimers?.instanceName).toBe('my-ospf');
        });

        it('should default instance name to "default"', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing ospf instance add router-id=1.1.1.1');

            command.execute(context);

            expect(device.ospfTimers?.instanceName).toBe('default');
        });

        it('should initialize OSPF structures', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing ospf instance add router-id=1.1.1.1');

            command.execute(context);

            expect(device.ospfNeighbors).toEqual([]);
            expect(device.ospfLsdb).toEqual([]);
        });
    });
});

describe('MikroTikOspfNetworkAddCommand', () => {
    let command: MikroTikOspfNetworkAddCommand;

    beforeEach(() => {
        command = new MikroTikOspfNetworkAddCommand();
    });

    describe('canHandle', () => {
        it('should handle /routing ospf network add', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing ospf network add network=10.0.0.0/24 area=backbone');

            expect(command.canHandle(context)).toBe(true);
        });
    });

    describe('validate', () => {
        it('should require OSPF to be enabled', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing ospf network add network=10.0.0.0/24 area=backbone');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('OSPF not enabled');
        });

        it('should require network parameter', () => {
            const device = createMockMikroTikDevice();
            device.ospfEnabled = true;
            const context = createMockMikroTikContext(device, '/routing ospf network add area=backbone');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('network');
        });

        it('should require area parameter', () => {
            const device = createMockMikroTikDevice();
            device.ospfEnabled = true;
            const context = createMockMikroTikContext(device, '/routing ospf network add network=10.0.0.0/24');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('area');
        });

        it('should pass with all parameters', () => {
            const device = createMockMikroTikDevice();
            device.ospfEnabled = true;
            const context = createMockMikroTikContext(device, '/routing ospf network add network=10.0.0.0/24 area=backbone');

            const validation = command.validate(context);
            expect(validation.valid).toBe(true);
        });
    });

    describe('execute', () => {
        it('should add network to LSDB', () => {
            const device = createMockMikroTikDevice();
            device.ospfEnabled = true;
            const context = createMockMikroTikContext(device, '/routing ospf network add network=10.0.0.0/24 area=backbone');

            command.execute(context);

            expect(device.ospfLsdb).toHaveLength(1);
            const entry = device.ospfLsdb[0];
            expect(entry.network).toBe('10.0.0.0');
            expect(entry.mask).toBe(24);
            expect(entry.area).toBe('backbone');
        });
    });
});

describe('MikroTikOspfInstancePrintCommand', () => {
    let command: MikroTikOspfInstancePrintCommand;

    beforeEach(() => {
        command = new MikroTikOspfInstancePrintCommand();
    });

    describe('canHandle', () => {
        it('should handle /routing ospf instance print', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing ospf instance print');

            expect(command.canHandle(context)).toBe(true);
        });

        it('should handle /routing ospf instance alone', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing ospf instance');

            expect(command.canHandle(context)).toBe(true);
        });
    });

    describe('execute', () => {
        it('should display header', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing ospf instance print');

            const result = command.execute(context);

            expect(result.output.some(line => line.includes('ROUTER-ID'))).toBe(true);
        });

        it('should show no instances when OSPF disabled', () => {
            const device = createMockMikroTikDevice();
            device.ospfEnabled = false;
            const context = createMockMikroTikContext(device, '/routing ospf instance print');

            const result = command.execute(context);

            expect(result.output.some(line => line.includes('no OSPF'))).toBe(true);
        });

        it('should display OSPF instance when enabled', () => {
            const device = createMockMikroTikDevice();
            device.ospfEnabled = true;
            device.routerId = '1.1.1.1';
            device.ospfTimers = { instanceName: 'default' };
            const context = createMockMikroTikContext(device, '/routing ospf instance print');

            const result = command.execute(context);

            expect(result.output.some(line => line.includes('1.1.1.1'))).toBe(true);
            expect(result.output.some(line => line.includes('default'))).toBe(true);
        });
    });
});

describe('MikroTikOspfNeighborPrintCommand', () => {
    let command: MikroTikOspfNeighborPrintCommand;

    beforeEach(() => {
        command = new MikroTikOspfNeighborPrintCommand();
    });

    describe('execute', () => {
        it('should display header', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing ospf neighbor print');

            const result = command.execute(context);

            expect(result.output.some(line => line.includes('ROUTER-ID'))).toBe(true);
            expect(result.output.some(line => line.includes('STATE'))).toBe(true);
        });

        it('should show no neighbors when empty', () => {
            const device = createMockMikroTikDevice();
            device.ospfNeighbors = [];
            const context = createMockMikroTikContext(device, '/routing ospf neighbor print');

            const result = command.execute(context);

            expect(result.output.some(line => line.includes('no OSPF neighbors'))).toBe(true);
        });

        it('should display neighbors when present', () => {
            const device = createMockMikroTikDevice();
            device.ospfNeighbors = [{
                neighborId: '2.2.2.2',
                interface: 'ether1',
                state: 'Full',
                address: '10.0.0.2'
            }];
            const context = createMockMikroTikContext(device, '/routing ospf neighbor print');

            const result = command.execute(context);

            expect(result.output.some(line => line.includes('2.2.2.2'))).toBe(true);
            expect(result.output.some(line => line.includes('Full'))).toBe(true);
        });
    });
});

describe('MikroTikOspfInterfaceAddCommand', () => {
    let command: MikroTikOspfInterfaceAddCommand;

    beforeEach(() => {
        command = new MikroTikOspfInterfaceAddCommand();
    });

    describe('validate', () => {
        it('should require OSPF to be enabled', () => {
            const device = createMockMikroTikDevice();
            const context = createMockMikroTikContext(device, '/routing ospf interface add interface=ether1');

            const validation = command.validate(context);
            expect(validation.valid).toBe(false);
        });

        it('should pass when OSPF is enabled', () => {
            const device = createMockMikroTikDevice();
            device.ospfEnabled = true;
            const context = createMockMikroTikContext(device, '/routing ospf interface add interface=ether1');

            const validation = command.validate(context);
            expect(validation.valid).toBe(true);
        });
    });

    describe('execute', () => {
        it('should set OSPF timers', () => {
            const device = createMockMikroTikDevice();
            device.ospfEnabled = true;
            const context = createMockMikroTikContext(device, '/routing ospf interface add interface=ether1 hello-interval=5 dead-interval=20');

            command.execute(context);

            expect(device.ospfTimers?.hello).toBe(5);
            expect(device.ospfTimers?.dead).toBe(20);
        });

        it('should use default timers when not specified', () => {
            const device = createMockMikroTikDevice();
            device.ospfEnabled = true;
            const context = createMockMikroTikContext(device, '/routing ospf interface add interface=ether1');

            command.execute(context);

            expect(device.ospfTimers?.hello).toBe(10);
            expect(device.ospfTimers?.dead).toBe(40);
        });
    });
});
