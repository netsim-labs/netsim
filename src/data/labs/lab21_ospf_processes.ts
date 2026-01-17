import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab21: Lab = {
    id: 'ospf-processes',
    title: 'Multi-Process OSPF',
    description: 'Learn to isolate routing domains by configuring multiple OSPF processes on a single router and controlling route exchange',
    difficulty: 'advanced',
    certification: 'hcip',
    estimatedTime: 50,
    prerequisites: ['Lab 11: OSPF Multi-area and ABR'],
    objectives: [
        'Configure independent OSPF processes',
        'Understand routing domain isolation',
        'Perform basic redistribution between processes',
        'Verify routing table with multiple OSPF origins'
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
            id: 'configure-p1-p2',
            title: 'Configure Process 1 and 2 on R2',
            description: 'On R2, configure ospf 1 towards R1 and ospf 2 towards R3',
            instructions: [
                'ospf 1: network 10.0.0.2 0.0.0.0 (Area 0)',
                'ospf 2: network 10.0.1.1 0.0.0.0 (Area 0)'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'ospf 1',
                    'area 0',
                    'network 10.0.0.2 0.0.0.0',
                    'quit',
                    'ospf 2',
                    'area 0',
                    'network 10.0.1.1 0.0.0.0',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'R2 must have OSPF enabled',
                    check: (context: LabValidationContext) => {
                        const r2 = context.devices.find(d => d.hostname === 'Router2');
                        return !!r2?.ospfEnabled;
                    },
                    errorMessage: 'OSPF processes have not been configured correctly'
                }
            ],
            points: 30
        }
    ],
    rewards: {
        stars: 3,
        experience: 400,
        badges: ['routing-master', 'ospf-expert']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
