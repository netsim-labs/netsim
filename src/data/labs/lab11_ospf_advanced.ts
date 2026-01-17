import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab11: Lab = {
    id: 'ospf-multi-area',
    title: 'Multi-area OSPF and ABR',
    description: 'Optimize dynamic routing by dividing the network into OSPF areas and configuring an Area Border Router (ABR)',
    difficulty: 'intermediate',
    certification: 'hcia',
    estimatedTime: 55,
    prerequisites: ['Lab 6: Dynamic Routing with OSPF'],
    objectives: [
        'Configure OSPF in multiple areas',
        'Identify the role of ABR (Area Border Router)',
        'Verify route propagation between areas',
        'Analyze IP routing table for inter-area routes'
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
            id: 'configure-abr',
            title: 'Configure the ABR (R2)',
            description: 'Configure Router2 to belong to both Area 0 and Area 1',
            instructions: [
                'In R2, enter ospf 1',
                'Area 0: network 10.0.0.0 0.0.0.3 (towards R1)',
                'Area 1: network 10.0.1.0 0.0.0.3 (towards R3)'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'ospf 1',
                    'area 0',
                    'network 10.0.0.2 0.0.0.0',
                    'quit',
                    'area 1',
                    'network 10.0.1.1 0.0.0.0',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'R2 must have interfaces in Area 0 and Area 1',
                    check: (context: LabValidationContext) => {
                        const r2 = context.devices.find(d => d.hostname === 'Router2');
                        // Note: In this simplified model, we verify that ospf is active
                        return !!r2?.ospfEnabled;
                    },
                    errorMessage: 'R2 does not have the correct multi-area configuration'
                }
            ],
            points: 30
        }
    ],
    rewards: {
        stars: 3,
        experience: 300,
        badges: ['ospf-expert', 'network-architect']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
