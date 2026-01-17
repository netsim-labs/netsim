import { NetworkDevice, NetworkCable } from '../../types/NetworkTypes';

interface ContainerlabTopology {
    name: string;
    topology: {
        nodes: Record<string, any>;
        links: { endpoints: string[] }[];
    };
}

const getDefaultKind = (vendor: string): string => {
    switch (vendor.toLowerCase()) {
        case 'cisco': return 'ceos';
        case 'huawei': return 'vr-sros'; // Nokia as placeholder or maybe a huawei generic?
        case 'arista': return 'ceos';
        case 'juniper': return 'vr-vmx';
        case 'pc': return 'linux';
        default: return 'linux';
    }
};

const getDefaultImage = (vendor: string): string => {
    switch (vendor.toLowerCase()) {
        case 'cisco': return 'ceos:4.32.0F';
        case 'huawei': return 'vr-sros:latest';
        case 'pc': return 'ghcr.io/hellt/network-multitool';
        default: return 'alpine:latest';
    }
};

const sanitizeName = (name: string): string => {
    return name.replace(/[^a-zA-Z0-9_-]/g, '_');
};

const mapPortName = (portLabel: string, _kind: string): string => {
    // Simple heuristic: 
    // If it's Linux, use generic naming or sanitized version
    // If it's a NOS, they usually handle standard names or map ethX to them

    // Convert "GigabitEthernet0/0/1" to "eth1" based on logic? 
    // Hard without knowing the specific interface mapping of every image.
    // Fallback: Sanitize slashes to dashes for compatibility
    return portLabel.replace(/\//g, '-').replace(/\s+/g, '');
};

const toYaml = (obj: any, indent = 0): string => {
    const spaces = '  '.repeat(indent);
    let yaml = '';

    if (Array.isArray(obj)) {
        obj.forEach(item => {
            yaml += `${spaces}- ${typeof item === 'object' ? toYaml(item, indent + 1).trim() : item}\n`;
        });
    } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    yaml += `${spaces}${key}: []\n`;
                } else if (typeof value[0] === 'string') {
                    // Optimized for links references ["a", "b"]
                    yaml += `${spaces}${key}: [${value.map((v: string) => `"${v}"`).join(', ')}]\n`;
                } else {
                    yaml += `${spaces}${key}:\n${toYaml(value, indent + 1)}`;
                }
            } else if (typeof value === 'object' && value !== null) {
                if (Object.keys(value).length === 0) {
                    yaml += `${spaces}${key}: {}\n`;
                } else {
                    yaml += `${spaces}${key}:\n${toYaml(value, indent + 1)}`;
                }
            } else {
                yaml += `${spaces}${key}: ${value}\n`;
            }
        });
    } else {
        return String(obj);
    }
    return yaml;
};

export const generateContainerlabConfig = (
    name: string,
    devices: NetworkDevice[],
    cables: NetworkCable[]
): string => {
    const clab: ContainerlabTopology = {
        name: name || 'netsim-topology',
        topology: {
            nodes: {},
            links: []
        }
    };

    // Process Nodes
    devices.forEach(dev => {
        const safeName = sanitizeName(dev.hostname);

        // Use containerlab config or defaults
        const kind = dev.containerlab?.kind || getDefaultKind(dev.vendor);
        const image = dev.containerlab?.image || getDefaultImage(dev.vendor);

        const nodeConfig: any = {
            kind,
            image,
        };

        if (dev.containerlab?.binds) nodeConfig.binds = dev.containerlab.binds;
        if (dev.containerlab?.env) nodeConfig.env = dev.containerlab.env;
        if (dev.containerlab?.cmd) nodeConfig.cmd = dev.containerlab.cmd;

        clab.topology.nodes[safeName] = nodeConfig;
    });

    // Process Links
    cables.forEach(cable => {
        const srcDev = devices.find(d => d.id === cable.sourceDeviceId);
        const dstDev = devices.find(d => d.id === cable.targetDeviceId);

        if (srcDev && dstDev) {
            const srcPortObj = srcDev.ports.find(p => p.id === cable.sourcePortId);
            const dstPortObj = dstDev.ports.find(p => p.id === cable.targetPortId);

            if (srcPortObj && dstPortObj) {
                const srcName = sanitizeName(srcDev.hostname);
                const dstName = sanitizeName(dstDev.hostname);

                const srcKind = srcDev.containerlab?.kind || getDefaultKind(srcDev.vendor);
                const dstKind = dstDev.containerlab?.kind || getDefaultKind(dstDev.vendor);

                const srcPort = mapPortName(srcPortObj.name, srcKind);
                const dstPort = mapPortName(dstPortObj.name, dstKind);

                clab.topology.links.push({
                    endpoints: [`${srcName}:${srcPort}`, `${dstName}:${dstPort}`]
                });
            }
        }
    });

    return toYaml(clab);
};
