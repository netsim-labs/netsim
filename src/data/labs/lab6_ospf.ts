import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab6: Lab = {
    id: 'ospf-single-area',
    title: 'Dynamic Routing with OSPF',
    description: 'Configure OSPF in a single area to automate route exchange between multiple routers',
    difficulty: 'basic',
    certification: 'hcia',
    estimatedTime: 50,
    prerequisites: ['Lab 4: Static Inter-area Routing', 'OSPF Area 0 Concepts'],
    objectives: [
        'Enable OSPF process and define Router ID',
        'Configure Area 0',
        'Announce directly connected networks',
        'Verify adjacencies and OSPF table'
    ],
    topology: {
        devices: [
            { type: 'Router', count: 3, config: { model: 'Huawei-AR617' } }
        ],
        connections: [
            { from: 'Router1:GE0/0/0', to: 'Router2:GE0/0/0', type: 'copper' },
            { from: 'Router2:GE0/0/1', to: 'Router3:GE0/0/1', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'ospf-r1',
            title: 'Configure OSPF on R1',
            description: 'Enable OSPF 1 with Router ID 1.1.1.1 on R1',
            instructions: [
                'Use ospf 1 router-id 1.1.1.1',
                'Configure area 0',
                'Announce the 10.0.0.0 0.0.0.3 network'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'ospf 1 router-id 1.1.1.1',
                    'area 0',
                    'network 10.0.0.0 0.0.0.3',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'R1 must have OSPF configured in area 0',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        return !!r1?.ospfEnabled && r1.routerId === '1.1.1.1';
                    },
                    errorMessage: 'R1 does not have OSPF configured correctly'
                }
            ],
            points: 20
        }
    ],
    rewards: {
        stars: 3,
        experience: 250,
        badges: ['ospf-init', 'dynamic-router']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
