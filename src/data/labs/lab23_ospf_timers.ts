import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab23: Lab = {
    id: 'convergence-optimization',
    title: 'Convergence Optimization',
    description: 'Adjust OSPF Hello and Dead timers to achieve faster failure detection and a more resilient network',
    difficulty: 'advanced',
    certification: 'hcip',
    estimatedTime: 40,
    prerequisites: ['Lab 6: Dynamic Routing with OSPF'],
    objectives: [
        'Modify Hello Timer and Dead Timer',
        'Understand the impact on CPU usage and stability',
        'Adjust LSA retransmission interval',
        'Verify adjacency with optimized times'
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
            id: 'tune-timers',
            title: 'Adjust Timers on R1 and R2',
            description: 'Configure Hello to 5s and Dead to 20s on GE0/0/0 interface of both routers',
            instructions: [
                'interface GigabitEthernet 0/0/0',
                'ospf timer hello 5',
                'ospf timer dead 20'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'interface GigabitEthernet 0/0/0',
                    'ospf timer hello 5',
                    'ospf timer dead 20',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Timers must be adjusted on R1',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        return !!r1?.ospfEnabled;
                    },
                    errorMessage: 'OSPF timers have not been configured correctly'
                }
            ],
            points: 25
        }
    ],
    rewards: {
        stars: 3,
        experience: 300,
        badges: ['fast-convergence', 'performance-tuner']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
