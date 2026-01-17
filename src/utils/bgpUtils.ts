import { NetworkDevice, NetworkCable, RouteEntry, AlarmEvent } from '../types/NetworkTypes';

type FindPathFn = (start: string, end: string, cables: NetworkCable[], devices: NetworkDevice[], vlan?: number) => string[] | null;

/**
 * Validates BGP connectivity and updates state machine
 */
export const recomputeBgp = (
    devices: NetworkDevice[],
    cables: NetworkCable[],
    findPath: FindPathFn
): { devices: NetworkDevice[], events: AlarmEvent[] } => {
    let events: AlarmEvent[] = [];

    // Deep copy to avoid mutating state directly during calculation
    const updatedDevices = devices.map(d => ({
        ...d,
        bgpConfig: d.bgpConfig ? { ...d.bgpConfig, neighbors: [...d.bgpConfig.neighbors] } : undefined
    }));

    // 1. Connectivity & FSM Update Loop
    updatedDevices.forEach(device => {
        if (!device.bgpConfig || !device.bgpConfig.enabled) return;

        device.bgpConfig.neighbors.forEach(neighbor => {
            // Find target device by Neighbor IP (simulated lookup)
            const targetDevice = findDeviceByIp(updatedDevices, neighbor.ip);

            if (!targetDevice) {
                neighbor.state = 'Idle'; // IP not found in topology
                return;
            }

            // Check if remote device has BGP enabled.
            if (!targetDevice.bgpConfig?.enabled) {
                neighbor.state = 'Active'; // TCP Refused (Simulated)
                return;
            }

            // Find valid local IP that talks to this neighbor (Source IP)
            const path = findPath(device.id, targetDevice.id, cables, devices);
            if (!path) {
                neighbor.state = 'Connect'; // TCP attempting but no route
                return;
            }

            // Check if target has us defined as neighbor
            const myLocalIps = getAllDeviceIps(device);
            if (!targetDevice.bgpConfig || !device.bgpConfig) {
                neighbor.state = 'Idle';
                return;
            }
            const remotePeerConfig = targetDevice.bgpConfig.neighbors.find(n => myLocalIps.includes(n.ip));

            if (!remotePeerConfig) {
                neighbor.state = 'Active'; // Connection refused (Not authorized)
                return;
            }

            // Check AS Matching
            if (remotePeerConfig.remoteAs !== device.bgpConfig?.asNumber) {
                neighbor.state = 'Idle'; // AS Mismatch
                return;
            }

            // Check Remote AS expectation
            if (neighbor.remoteAs !== targetDevice.bgpConfig?.asNumber) {
                neighbor.state = 'Idle'; // Config mismatch locally
                return;
            }

            // If all good -> ESTABLISHED
            const prevState = neighbor.state;
            neighbor.state = 'Established';
            neighbor.uptime = (neighbor.uptime || Date.now());

            if (prevState !== 'Established') {
                events.push({
                    id: crypto.randomUUID(),
                    deviceId: device.id,
                    deviceName: device.hostname,
                    type: 'bgp',
                    severity: 'info',
                    message: `BGP Neighbor ${neighbor.ip} (AS ${neighbor.remoteAs}) is Up`,
                    timestamp: Date.now(),
                    acknowledged: false
                });
            }
        });
    });

    // 2. Route Propagation (NLRI Exchange)
    updatedDevices.forEach(device => {
        if (!device.bgpConfig?.enabled) return;

        const nonBgpRoutes = (device.routingTable || []).filter(r => r.proto !== 'BGP');
        const candidateBgpRoutes: RouteEntry[] = [];

        device.bgpConfig.neighbors.forEach(neighbor => {
            if (neighbor.state !== 'Established') return;

            const targetDevice = findDeviceByIp(updatedDevices, neighbor.ip);
            if (!targetDevice || !targetDevice.bgpConfig) return;

            const isEbgp = device.bgpConfig!.asNumber !== targetDevice.bgpConfig!.asNumber;

            // 1. Networks explicitly declared via 'network' command from the peer
            targetDevice.bgpConfig.networks.forEach(net => {
                const [addr, mask] = parseCidr(net);
                candidateBgpRoutes.push({
                    destination: addr,
                    mask: mask,
                    proto: 'BGP',
                    pre: 255,
                    cost: 0,
                    nextHop: neighbor.ip,
                    interface: 'Recursive',
                    bgpAttributes: {
                        localPref: targetDevice.bgpConfig?.defaultLocalPreference || 100,
                        asPath: [targetDevice.bgpConfig!.asNumber],
                        origin: 'IGP',
                        med: 0
                    }
                });
            });

            // 2. Transitive BGP routes from the peer's routing table
            const neighborBgpRoutes = (targetDevice.routingTable || []).filter(r => r.proto === 'BGP');

            neighborBgpRoutes.forEach(route => {
                const routeAsPath = route.bgpAttributes?.asPath || [];

                // EBGP Loop Prevention: don't accept if our own AS is in the path
                if (isEbgp && routeAsPath.includes(device.bgpConfig!.asNumber)) {
                    return;
                }

                // IBGP Split Horizon: simplified for Phase 3
                if (!isEbgp && !(neighbor.isClient)) {
                    // Normally we'd check if target is RR or we are client, 
                    // for now just allow if it was recently updated or originated by target
                }


                const newAttributes = { ...(route.bgpAttributes || { localPref: 100, asPath: [], origin: 'IGP' as const, med: 0 }) };

                if (isEbgp) {
                    // Prepend AS
                    newAttributes.asPath = [targetDevice.bgpConfig!.asNumber, ...routeAsPath];
                }

                candidateBgpRoutes.push({
                    ...route,
                    nextHop: neighbor.nextHopSelf ? neighbor.ip : (route.nextHop || neighbor.ip),
                    bgpAttributes: newAttributes
                });
            });
        });

        // 3. Best Path Selection Algorithm (simplified)
        // Groups routes by destination/mask
        const routesByDest = new Map<string, RouteEntry[]>();
        candidateBgpRoutes.forEach(r => {
            const key = `${r.destination}/${r.mask}`;
            if (!routesByDest.has(key)) routesByDest.set(key, []);
            routesByDest.get(key)!.push(r);
        });

        const bestRoutes: RouteEntry[] = [];
        routesByDest.forEach((variants) => {
            // Sort variants by BGP Best Path Selection
            variants.sort((a, b) => {
                const attrA = a.bgpAttributes!;
                const attrB = b.bgpAttributes!;

                // 1. Weight (Highest)
                if ((attrB.weight || 0) !== (attrA.weight || 0)) return (attrB.weight || 0) - (attrA.weight || 0);

                // 2. Local Preference (Highest)
                if ((attrB.localPref || 100) !== (attrA.localPref || 100)) return (attrB.localPref || 100) - (attrA.localPref || 100);

                // 3. Locally Originated (Skip for simplicity as we don't track origin source well here)

                // 4. AS Path Length (Shortest)
                if ((attrA.asPath?.length || 0) !== (attrB.asPath?.length || 0)) return (attrA.asPath?.length || 0) - (attrB.asPath?.length || 0);

                // 5. Origin (IGP < EGP < Incomplete)
                const originOrder = { 'IGP': 0, 'EGP': 1, 'Incomplete': 2 };
                if (originOrder[attrA.origin || 'IGP'] !== originOrder[attrB.origin || 'IGP'])
                    return originOrder[attrA.origin || 'IGP'] - originOrder[attrB.origin || 'IGP'];

                // 6. MED (Lowest)
                if ((attrA.med || 0) !== (attrB.med || 0)) return (attrA.med || 0) - (attrB.med || 0);

                return 0; // Tie
            });

            // Take the best one
            bestRoutes.push(variants[0]);
        });

        device.routingTable = [...nonBgpRoutes, ...bestRoutes];
    });

    return { devices: updatedDevices, events };
};

// --- Helpers ---

const findDeviceByIp = (devices: NetworkDevice[], ip: string): NetworkDevice | undefined => {
    return devices.find(d =>
        d.ports.some(p => p.config.ipAddress === ip && p.status === 'up') ||
        d.vlanifs?.some(v => v.ipAddress === ip && v.enabled)
    );
};

const getAllDeviceIps = (device: NetworkDevice): string[] => {
    const ips: string[] = [];
    device.ports.forEach(p => {
        if (p.config.ipAddress) ips.push(p.config.ipAddress);
    });
    device.vlanifs?.forEach(v => {
        if (v.ipAddress) ips.push(v.ipAddress);
    });
    return ips;
};

const parseCidr = (cidr: string): [string, number] => {
    const [ip, maskStr] = cidr.split('/');
    return [ip, parseInt(maskStr || '24')];
};
