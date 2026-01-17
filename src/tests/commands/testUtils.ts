
import { vi } from 'vitest';
import { CommandContext } from '../../store/slices/cli/commands/base/Command';
import { NetworkDevice, NetworkCable, NetworkPort } from '../../types/NetworkTypes';
import { CliVendorProfile, CliVendorProfileId } from '../../utils/cliProfiles';

/**
 * Vendor profile templates for testing
 */
const vendorProfiles: Record<CliVendorProfileId, Partial<CliVendorProfile>> = {
    huawei: {
        id: 'huawei',
        label: 'Huawei VRP',
    },
    cisco: {
        id: 'cisco',
        label: 'Cisco IOS',
    },
    yunshan: {
        id: 'yunshan',
        label: 'YunShan OS',
    },
    aruba: {
        id: 'aruba',
        label: 'Aruba AOS-CX',
    },
    mikrotik: {
        id: 'mikrotik',
        label: 'MikroTik RouterOS',
    }
};

/**
 * Creates a mock network device for testing
 */
export const createMockDevice = (overrides: Partial<NetworkDevice> = {}): NetworkDevice => {
    const defaultPort: NetworkPort = {
        id: 'port-1',
        name: 'Ethernet0/0/1',
        type: 'RJ45',
        status: 'up',
        config: {
            mode: 'access',
            enabled: true,
            vlan: 1,
        }
    };

    return {
        id: 'device-1',
        vendor: 'Huawei',
        model: 'Huawei-S5700-28TP',
        hostname: 'Device1',
        ports: [defaultPort],
        position: { x: 0, y: 0 },
        vlans: [1],
        consoleLogs: [],
        cliState: {
            view: 'user-view'
        },
        routingTable: [],
        ...overrides
    };
};

/**
 * Creates a mock Aruba device for testing
 */
export const createMockArubaDevice = (overrides: Partial<NetworkDevice> = {}): NetworkDevice => {
    return createMockDevice({
        vendor: 'Aruba',
        model: 'Aruba-CX-6300',
        hostname: 'ArubaSwitch',
        ...overrides
    });
};

/**
 * Creates a mock MikroTik device for testing
 */
export const createMockMikroTikDevice = (overrides: Partial<NetworkDevice> = {}): NetworkDevice => {
    return createMockDevice({
        vendor: 'MikroTik',
        model: 'MikroTik-CRS326',
        hostname: 'MikroTik',
        ...overrides
    });
};

/**
 * Creates a mock command context
 */
export const createMockContext = (
    device: NetworkDevice,
    rawInput: string = '',
    devices: NetworkDevice[] = [device],
    cables: NetworkCable[] = [],
    vendorId: CliVendorProfileId = 'huawei'
): CommandContext => {
    const profile = vendorProfiles[vendorId] || vendorProfiles.huawei;

    const emptyHelpMap = {
        'user-view': [] as string[],
        'system-view': [] as string[],
        'interface-view': [] as string[],
        'pool-view': [] as string[]
    };

    return {
        device,
        devices,
        cables,
        profile: {
            id: profile.id!,
            label: profile.label!,
            description: '',
            help: emptyHelpMap,
            suggestions: emptyHelpMap,
            aliases: {},
            registry: []
        } as CliVendorProfile,
        rawInput,
        normalizedCommand: rawInput.trim(),
        args: rawInput.trim().split(/\s+/),
        cloneDevice: vi.fn((id: string) => devices.find(d => d.id === id)),
        highlightTraffic: vi.fn(),
        utils: {
            getNetworkAddress: vi.fn((ip: string, mask: number) => `${ip}/${mask}`),
            getNextIp: vi.fn(),
            findPath: vi.fn(),
            recomputeOspf: vi.fn(),
            generateUUID: vi.fn(() => 'uuid-' + Math.random().toString(36).substring(2, 11))
        }
    };
};

/**
 * Creates a mock Aruba context for testing
 */
export const createMockArubaContext = (
    device: NetworkDevice,
    rawInput: string = '',
    devices: NetworkDevice[] = [device],
    cables: NetworkCable[] = []
): CommandContext => {
    return createMockContext(device, rawInput, devices, cables, 'aruba');
};

/**
 * Creates a mock MikroTik context for testing
 */
export const createMockMikroTikContext = (
    device: NetworkDevice,
    rawInput: string = '',
    devices: NetworkDevice[] = [device],
    cables: NetworkCable[] = []
): CommandContext => {
    return createMockContext(device, rawInput, devices, cables, 'mikrotik');
};
