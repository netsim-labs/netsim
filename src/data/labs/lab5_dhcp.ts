import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab5: Lab = {
    id: 'dhcp-services',
    title: 'DHCP Server Configuration',
    description: 'Automate IP address assignment in your network by configuring a DHCP server on the router',
    difficulty: 'basic',
    certification: 'hcia',
    estimatedTime: 30,
    prerequisites: ['Lab 1: Basic Campus LAN'],
    objectives: [
        'Enable DHCP service globally',
        'Create an IP address pool',
        'Configure gateway and DNS in the pool',
        'Verify dynamic assignment on the clients'
    ],
    topology: {
        devices: [
            { type: 'Router', count: 1, config: { model: 'Huawei-AR617' } },
            { type: 'Switch', count: 1, config: { model: 'Huawei-S5700-28TP' } },
            { type: 'PC', count: 2 }
        ],
        connections: [
            { from: 'Router1:GE0/0/1', to: 'Switch1:GE0/0/24', type: 'copper' },
            { from: 'Switch1:GE0/0/1', to: 'PC1:eth0', type: 'copper' },
            { from: 'Switch1:GE0/0/2', to: 'PC2:eth0', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'dhcp-enable',
            title: 'Enable DHCP',
            description: 'Enable DHCP service on the router',
            instructions: [
                'On Router1, use the command dhcp enable',
                'Verify that the service is active'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'dhcp enable',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'DHCP must be enabled globally',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        return !!r1?.dhcpEnabled;
                    },
                    errorMessage: 'DHCP service is not enabled on Router1'
                }
            ],
            points: 15
        },
        {
            id: 'create-pool',
            title: 'Create Pool "LAN1"',
            description: 'Define an address pool for the 192.168.10.0/24 network',
            instructions: [
                'Create the pool with ip pool LAN1',
                'Network: 192.168.10.0 mask 24',
                'Gateway: 192.168.10.1',
                'DNS: 8.8.8.8'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'ip pool LAN1',
                    'network 192.168.10.0 mask 255.255.255.0',
                    'gateway-list 192.168.10.1',
                    'dns-list 8.8.8.8',
                    'quit',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Pool LAN1 must be correctly configured',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const pool = r1?.dhcpPools?.find(p => p.name === 'LAN1');
                        return pool?.network === '192.168.10.0' && pool.mask === 24 && pool.gateway === '192.168.10.1';
                    },
                    errorMessage: 'DHCP pool LAN1 is not configured correctly'
                }
            ],
            points: 35
        }
    ],
    rewards: {
        stars: 3,
        experience: 150,
        badges: ['dhcp-admin', 'auto-config']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
