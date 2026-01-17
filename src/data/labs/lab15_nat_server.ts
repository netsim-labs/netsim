import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab15: Lab = {
    id: 'nat-server',
    title: 'NAT Server (Service Publication)',
    description: 'Learn to publish an internal server (e.g., Web or FTP) so it is accessible from the Internet using NAT Server',
    difficulty: 'intermediate',
    certification: 'hcia',
    estimatedTime: 40,
    prerequisites: ['Lab 8: Address Translation (NAT)'],
    objectives: [
        'Configure static port mapping',
        'Publish port 80 of an internal server',
        'Understand the difference between NAT and NAT Server',
        'Verify access from the outside'
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
            id: 'nat-server-config',
            title: 'Configure NAT Server',
            description: 'Map global port 80 of public IP 200.1.1.1 to internal port 80 of PC1 (192.168.1.10)',
            instructions: [
                'In interface GigabitEthernet 0/0/0:',
                'nat server protocol tcp global 200.1.1.1 80 inside 192.168.1.10 80'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'interface GigabitEthernet 0/0/0',
                    'nat server protocol tcp global 200.1.1.1 80 inside 192.168.1.10 80',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'NAT Server must be configured for port 80',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const rule = r1?.natRules?.find(n => n.publicPort === 80 && n.privateIp === '192.168.1.10');
                        return !!rule;
                    },
                    errorMessage: 'NAT Server has not been configured correctly'
                }
            ],
            points: 30
        }
    ],
    rewards: {
        stars: 3,
        experience: 250,
        badges: ['server-publisher', 'nat-pro']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
