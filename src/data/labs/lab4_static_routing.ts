import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab4: Lab = {
    id: 'static-routing',
    title: 'Static Inter-area Routing',
    description: 'Establish communication between remote networks by configuring static routes on routers',
    difficulty: 'basic',
    certification: 'hcia',
    estimatedTime: 45,
    prerequisites: ['Lab 1: Basic Campus LAN', 'IP Subnetting Concepts'],
    objectives: [
        'Configure IP addresses on Router interfaces',
        'Create static routes to remote networks',
        'Verify the routing table',
        'Test end-to-end (E2E) connectivity'
    ],
    topology: {
        devices: [
            { type: 'Router', count: 2, config: { model: 'Huawei-AR617' } },
            { type: 'PC', count: 2 }
        ],
        connections: [
            { from: 'Router1:GE0/0/0', to: 'Router2:GE0/0/0', type: 'copper' },
            { from: 'Router1:GE0/0/1', to: 'PC1:eth0', type: 'copper' },
            { from: 'Router2:GE0/0/1', to: 'PC2:eth0', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'r1-ip-config',
            title: 'Configure IP on R1',
            description: 'Configure the IPs on GE0/0/0 and GE0/0/1 of Router1',
            instructions: [
                'GE0/0/0 (Enlace R1-R2): 10.0.0.1/30',
                'GE0/0/1 (LAN R1): 192.168.1.1/24'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'interface GigabitEthernet 0/0/0',
                    'ip address 10.0.0.1 30',
                    'quit',
                    'interface GigabitEthernet 0/0/1',
                    'ip address 192.168.1.1 24',
                    'quit',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'R1 must have the correct IPs',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        if (!r1) return false;
                        const p0 = r1.ports.find(p => p.name.includes('0/0/0'));
                        const p1 = r1.ports.find(p => p.name.includes('0/0/1'));
                        return p0?.config.ipAddress === '10.0.0.1' && p1?.config.ipAddress === '192.168.1.1';
                    },
                    errorMessage: 'Router1 does not have the IPs configured correctly'
                }
            ],
            points: 20
        },
        {
            id: 'static-route-r1',
            title: 'Static Route on R1',
            description: 'Configure a static route on R1 to reach R2 LAN (192.168.2.0/24)',
            instructions: [
                'Use ip route-static 192.168.2.0 24 10.0.0.2',
                'Verify with display ip routing-table'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'ip route-static 192.168.2.0 255.255.255.0 10.0.0.2',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'R1 must have the static route configured',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        return !!r1?.routingTable?.find(r => r.destination === '192.168.2.0' && r.nextHop === '10.0.0.2');
                    },
                    errorMessage: 'R1 does not have the static route to 192.168.2.0/24'
                }
            ],
            points: 30
        }
    ],
    rewards: {
        stars: 3,
        experience: 200,
        badges: ['static-router', 'path-finder']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
