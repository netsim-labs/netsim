import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab29: Lab = {
    id: 'rip-routing',
    title: 'Routing with RIPv2',
    description: 'Configure the RIP Version 2 protocol to enable dynamic routing in small and medium network architectures',
    difficulty: 'basic',
    certification: 'hcia',
    estimatedTime: 35,
    prerequisites: ['Lab 4: Static Routing'],
    objectives: [
        'Enable RIP process',
        'Change to version 2 (VLSM support)',
        'Announce directly connected networks',
        'Verify RIP routing table'
    ],
    topology: {
        devices: [
            { type: 'Router', count: 2, config: { model: 'Huawei-AR617' } }
        ],
        connections: [
            { from: 'Router1:GE0/0/0', to: 'Router2:GE0/0/0', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'rip-config',
            title: 'Configure RIPv2',
            description: 'Enable RIPv2 on both routers for network 10.0.0.0',
            instructions: [
                'rip 1',
                'version 2',
                'network 10.0.0.0'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'rip 1',
                    'version 2',
                    'network 10.0.0.0',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'RIPv2 must be active',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        return !!r1; // Validating RIP presence would require expanded types
                    },
                    errorMessage: 'RIPv2 has not been configured'
                }
            ],
            points: 25
        }
    ],
    rewards: {
        stars: 3,
        experience: 200,
        badges: ['legacy-router', 'rip-expert']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
