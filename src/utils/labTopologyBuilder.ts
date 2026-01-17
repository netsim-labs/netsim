import { Lab, NetworkDevice, NetworkCable } from '../types/NetworkTypes';
import { deviceFactory } from '../store/slices/createTopologySlice';
import { generateUUID } from './common';

export const buildLabTopology = (lab: Lab): { devices: NetworkDevice[]; cables: NetworkCable[] } => {
    const devices: NetworkDevice[] = [];
    const cables: NetworkCable[] = [];
    const deviceMap: Record<string, NetworkDevice> = {};

    // 1. Create Devices
    let currentX = 150;
    let currentY = 150;

    lab.topology.devices.forEach((devDef) => {
        const devType = devDef.type || 'Switch';
        const model = devDef.config?.model || (devType === 'Router' ? 'Huawei-AR6121' : devType === 'PC' ? 'PC' : 'Huawei-S5700-28TP');

        for (let i = 0; i < devDef.count; i++) {
            const device = deviceFactory(model, { x: currentX, y: currentY });

            // Name resolution: if count is 1 and it's Switch/Router, use that exactly
            // Otherwise use Name + Index
            let name = devDef.type;
            if (devDef.count > 1 || (devDef.type !== 'Switch' && devDef.type !== 'Router' && devDef.type !== 'Internet')) {
                name = `${devDef.type}${i + 1}`;
            }

            // Override if explicit names are needed based on common lab patterns
            // In lab1: Switch, PC1, PC2
            if (devDef.type === 'Switch' && devDef.count === 1) name = 'Switch';
            if (devDef.type === 'Router' && devDef.count === 1) name = 'Router';

            device.hostname = name;
            devices.push(device);
            deviceMap[name] = device;

            currentX += 250;
            if (currentX > 800) {
                currentX = 150;
                currentY += 200;
            }
        }
    });

    // 2. Create Connections
    lab.topology.connections.forEach((conn) => {
        const [dev1Name, port1Name] = conn.from.split(':');
        const [dev2Name, port2Name] = conn.to.split(':');

        const dev1 = deviceMap[dev1Name];
        const dev2 = deviceMap[dev2Name];

        if (!dev1 || !dev2) {
            console.warn(`Could not find device for connection: ${conn.from} -> ${conn.to}`);
            return;
        }

        const findPort = (dev: NetworkDevice, pName: string) => {
            // Fuzzy match: if port name is 'eth0', it should match 'eth0'
            // If it's 'GE0/0/1', it should match 'GE0/0/1' or 'GigabitEthernet0/0/1'
            const normalized = pName.toLowerCase();
            return dev.ports.find(p =>
                p.name.toLowerCase() === normalized ||
                p.name.toLowerCase().includes(normalized) ||
                normalized.includes(p.name.toLowerCase())
            ) || dev.ports.find(p => !p.connectedCableId);
        };

        const port1 = findPort(dev1, port1Name);
        const port2 = findPort(dev2, port2Name);

        if (port1 && port2) {
            const cableId = generateUUID();
            const cable: NetworkCable = {
                id: cableId,
                type: conn.type === 'fiber' ? 'Fiber' : 'Copper',
                sourceDeviceId: dev1.id,
                sourcePortId: port1.id,
                targetDeviceId: dev2.id,
                targetPortId: port2.id
            };

            cables.push(cable);

            // Update physical status
            port1.status = 'up';
            port1.connectedCableId = cableId;
            port2.status = 'up';
            port2.connectedCableId = cableId;
        } else {
            console.warn(`Could not find ports for connection: ${conn.from} (${port1Name}) -> ${conn.to} (${port2Name})`);
        }
    });

    return { devices, cables };
};
