
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VlanCommand } from '../../../store/slices/cli/commands/network/VlanCommand';
import { createMockContext, createMockDevice } from '../testUtils';
import { NetworkDevice } from '../../../types/NetworkTypes';

vi.mock('../../../store/slices/cli/validators/index', () => ({
    validateVlanId: vi.fn((id) => ({ valid: true })),
    validateCliView: vi.fn((dev, required) => {
        // Simple mock: if device view is in required list, it's valid
        if (required.includes(dev.cliState.view)) {
            return { valid: true };
        }
        return { valid: false, error: 'Wrong view' };
    })
}));

describe('VlanCommand', () => {
    let command: VlanCommand;
    let huaweiDevice: NetworkDevice;
    let ciscoDevice: NetworkDevice;

    beforeEach(() => {
        command = new VlanCommand();
        huaweiDevice = createMockDevice({ vendor: 'Huawei', cliState: { view: 'system-view' } });
        ciscoDevice = createMockDevice({ vendor: 'Cisco', cliState: { view: 'system-view' } });
    });

    it('should require system-view', () => {
        huaweiDevice.cliState.view = 'user-view';
        const context = createMockContext(huaweiDevice, 'vlan batch 10');
        const result = command.validate(context);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Wrong view');
    });

    it('should handle Huawei "vlan batch"', () => {
        const context = createMockContext(huaweiDevice, 'vlan batch 10 20');
        const result = command.execute(context);

        expect(result.output[0]).toContain('Info: VLANs creadas 10, 20');
        expect(huaweiDevice.vlans).toContain(10);
        expect(huaweiDevice.vlans).toContain(20);
    });

    it('should reject Huawei "vlan" without batch', () => {
        const context = createMockContext(huaweiDevice, 'vlan 10');
        const result = command.validate(context);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('requires "batch"');
    });

    it('should handle Cisco "vlan <id>"', () => {
        const context = createMockContext(ciscoDevice, 'vlan 50');
        // Override profile for mock context
        context.profile.id = 'cisco';

        const result = command.execute(context);

        expect(result.output[0]).toContain('vlan 50');
        expect(ciscoDevice.vlans).toContain(50);
    });
});
