import * as yaml from 'js-yaml';
import { NetworkDevice, NetworkCable } from '../types/NetworkTypes.js';

export interface ExportedTopology {
    version: string;
    metadata: {
        exportedAt: string;
        description: string;
    };
    devices: {
        id: string;
        hostname: string;
        model: string;
        vendor: string;
        position: { x: number; y: number };
        config?: {
            ports: {
                name: string;
                mode: string;
                vlan?: number;
                allowedVlans?: number[];
                ipAddress?: string;
                subnetMask?: number;
                enabled: boolean;
            }[];
            vlans?: number[];
            dhcpEnabled?: boolean;
            ospfEnabled?: boolean;
        };
    }[];
    cables: {
        type: string;
        from: string; // "hostname/portName"
        to: string;   // "hostname/portName"
    }[];
}

export class ExportManager {
    static serialize(devices: NetworkDevice[], cables: NetworkCable[]): string {
        const exported: ExportedTopology = {
            version: '1.0',
            metadata: {
                exportedAt: new Date().toISOString(),
                description: 'NetSim Topology Export',
            },
            devices: devices.map(dev => ({
                id: dev.id,
                hostname: dev.hostname,
                model: dev.model,
                vendor: dev.vendor,
                position: dev.position,
                config: {
                    vlans: dev.vlans,
                    dhcpEnabled: dev.dhcpEnabled,
                    ospfEnabled: dev.ospfEnabled,
                    ports: dev.ports.map(p => ({
                        name: p.name,
                        mode: p.config.mode,
                        vlan: p.config.vlan,
                        allowedVlans: p.config.allowedVlans,
                        ipAddress: p.config.ipAddress,
                        subnetMask: p.config.subnetMask,
                        enabled: p.config.enabled,
                    })),
                }
            })),
            cables: cables.map(cable => {
                const srcDev = devices.find(d => d.id === cable.sourceDeviceId);
                const srcPort = srcDev?.ports.find(p => p.id === cable.sourcePortId);
                const dstDev = devices.find(d => d.id === cable.targetDeviceId);
                const dstPort = dstDev?.ports.find(p => p.id === cable.targetPortId);

                return {
                    type: cable.type,
                    from: `${srcDev?.hostname}/${srcPort?.name}`,
                    to: `${dstDev?.hostname}/${dstPort?.name}`,
                };
            }),
        };

        return yaml.dump(exported, {
            indent: 2,
            lineWidth: -1,
            noRefs: true,
            sortKeys: true,
        });
    }

    static deserialize(yamlString: string, catalog: any[]): { devices: NetworkDevice[], cables: NetworkCable[] } | null {
        try {
            const data = yaml.load(yamlString) as ExportedTopology;
            if (!data || data.version !== '1.0') return null;

            const newDevices: NetworkDevice[] = [];
            const hostnameToId = new Map<string, string>();

            // 1. Reconstruct Devices
            for (const d of data.devices) {
                const meta = catalog.find(m => m.model === d.model);
                if (!meta) continue;

                // Create base ports from catalog
                const ports: any[] = [];

                if (meta.ports.ge) {
                    for (let i = 0; i < meta.ports.ge; i++) {
                        ports.push({
                            id: `${d.id}-ge-${i}`,
                            name: `GigabitEthernet0/${i}`,
                            type: 'RJ45',
                            status: 'down',
                            config: { mode: 'access', vlan: 1, enabled: true }
                        });
                    }
                }
                if (meta.ports.xge) {
                    for (let i = 0; i < meta.ports.xge; i++) {
                        ports.push({
                            id: `${d.id}-xge-${i}`,
                            name: `TenGigabitEthernet0/${i}`,
                            type: 'SFP',
                            status: 'down',
                            config: { mode: 'trunk', enabled: true }
                        });
                    }
                }

                // Apply config from YAML to matching ports
                if (d.config?.ports) {
                    for (const pc of d.config.ports) {
                        const port = ports.find(p => p.name === pc.name);
                        if (port) {
                            port.config = { ...port.config, ...pc };
                        }
                    }
                }

                const device: NetworkDevice = {
                    id: d.id,
                    type: (d.model.includes('Router') ? 'Router' : d.model.includes('PC') ? 'PC' : 'Switch') as any, // Simple inference
                    status: 'on',
                    vendor: d.vendor as any,
                    hostname: d.hostname,
                    model: d.model as any,
                    position: d.position,
                    ports: ports,
                    vlans: d.config?.vlans || [1],
                    dhcpEnabled: d.config?.dhcpEnabled,
                    ospfEnabled: d.config?.ospfEnabled,
                    consoleLogs: [],
                    cliState: { view: 'user-view' },
                };

                newDevices.push(device);
                hostnameToId.set(d.hostname, d.id);
            }

            // 2. Reconstruct Cables
            const newCables: NetworkCable[] = [];
            for (const c of data.cables) {
                const [srcHost, srcPortName] = c.from.split('/');
                const [dstHost, dstPortName] = c.to.split('/');

                const srcDevId = hostnameToId.get(srcHost);
                const dstDevId = hostnameToId.get(dstHost);
                if (!srcDevId || !dstDevId) continue;

                const srcDev = newDevices.find(d => d.id === srcDevId);
                const dstDev = newDevices.find(d => d.id === dstDevId);

                const srcPort = srcDev?.ports.find(p => p.name === srcPortName);
                const dstPort = dstDev?.ports.find(p => p.name === dstPortName);

                if (srcPort && dstPort) {
                    const cableId = `cable-${Math.random().toString(36).substr(2, 9)}`;
                    newCables.push({
                        id: cableId,
                        type: c.type as any,
                        sourceDeviceId: srcDevId,
                        sourcePortId: srcPort.id,
                        targetDeviceId: dstDevId,
                        targetPortId: dstPort.id
                    });

                    // Update ports as connected
                    srcPort.connectedCableId = cableId;
                    dstPort.connectedCableId = cableId;
                    srcPort.status = 'up';
                    dstPort.status = 'up';
                }
            }

            return { devices: newDevices, cables: newCables };
        } catch (e) {
            console.error('Failed to parse YAML:', e);
            return null;
        }
    }
}
