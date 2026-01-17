import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab16: Lab = {
    id: 'dhcp-relay',
    title: 'DHCP Relay Agent',
    description: 'Configure a DHCP relay agent so that clients in different routed networks can obtain their IP from a central server',
    difficulty: 'intermediate',
    certification: 'hcia',
    estimatedTime: 45,
    prerequisites: ['Lab 5: DHCP Server Configuration'],
    objectives: [
        'Configure DHCP Relay on a router interface',
        'Specify the remote DHCP server IP',
        'Allow DHCP traffic through the infrastructure',
        'Verify IP acquisition in remote subnets'
    ],
    topology: {
        devices: [
            { type: 'Router', count: 2, config: { model: 'Huawei-AR617' } },
            { type: 'PC', count: 1 }
        ],
        connections: [
            { from: 'Router1:GE0/0/0', to: 'Router2:GE0/0/0', type: 'copper' },
            { from: 'Router2:GE0/0/1', to: 'PC1:eth0', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'dhcp-relay-config',
            title: 'Configure DHCP Relay on R2',
            description: 'Configure R2 to forward DHCP requests from its LAN to the DHCP server on R1 (10.0.0.1)',
            instructions: [
                'On R2, activate dhcp enable',
                'interface GigabitEthernet 0/0/1',
                'dhcp select relay',
                'dhcp relay server-ip 10.0.0.1'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'dhcp enable',
                    'interface GigabitEthernet 0/0/1',
                    'dhcp select relay',
                    'dhcp relay server-ip 10.0.0.1',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'R2 must have DHCP Relay active to R1',
                    check: (context: LabValidationContext) => {
                        const r2 = context.devices.find(d => d.hostname === 'Router2');
                        const port = r2?.ports.find(p => p.name.includes('0/0/1'));
                        return !!port?.config.helperAddresses?.includes('10.0.0.1');
                    },
                    errorMessage: 'DHCP Relay is not configured towards R1 IP'
                }
            ],
            points: 40
        }
    ],
    rewards: {
        stars: 3,
        experience: 300,
        badges: ['relay-agent', 'ip-helper-pro']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
