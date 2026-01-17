import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab8: Lab = {
    id: 'static-nat',
    title: 'Address Translation (NAT)',
    description: 'Allow your internal devices to access the Internet or be accessible from the outside using NAT',
    difficulty: 'basic',
    certification: 'hcia',
    estimatedTime: 40,
    prerequisites: ['Lab 4: Static Inter-area Routing'],
    objectives: [
        'Configure Inside and Outside interfaces',
        'Configure Static NAT (1-to-1)',
        'Verify address translation',
        'Test connectivity to the outside'
    ],
    topology: {
        devices: [
            { type: 'Router', count: 1, config: { model: 'Huawei-AR617' } },
            { type: 'PC', count: 1 }
        ],
        connections: [
            { from: 'Router1:GE0/0/0', to: 'Internet:GW', type: 'copper' },
            { from: 'Router1:GE0/0/1', to: 'PC1:eth0', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'nat-static-config',
            title: 'Configure Static NAT',
            description: 'Map the private IP of PC1 (192.168.1.10) to the public IP 200.1.1.1',
            instructions: [
                'On the WAN interface (GE0/0/0), configure nat static global 200.1.1.1 inside 192.168.1.10',
                'Verify with display nat static'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'interface GigabitEthernet 0/0/0',
                    'nat static global 200.1.1.1 inside 192.168.1.10',
                    'quit',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Static NAT mapping must exist',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        return !!r1?.natRules?.find(n => n.type === 'static' && n.publicIp === '200.1.1.1' && n.privateIp === '192.168.1.10');
                    },
                    errorMessage: 'Static NAT is not configured correctly'
                }
            ],
            points: 30
        }
    ],
    rewards: {
        stars: 3,
        experience: 200,
        badges: ['nat-begginer', 'ip-translator']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
