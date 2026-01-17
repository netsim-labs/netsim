import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab22: Lab = {
    id: 'route-redistribution',
    title: 'Route Redistribution',
    description: 'Exchange routing information between different protocols by importing static routes into OSPF and vice versa',
    difficulty: 'advanced',
    certification: 'hcip',
    estimatedTime: 45,
    prerequisites: ['Lab 6: Dynamic Routing with OSPF', 'Lab 4: Static Routing'],
    objectives: [
        'Configure import-route command in OSPF',
        'Control metric for imported routes',
        'Propagate a default route into the OSPF domain',
        'Verify external routes (LSA Type 5)'
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
            id: 'import-static',
            title: 'Import Static Routes',
            description: 'On R1, import configured static routes into OSPF process 1',
            instructions: [
                'ospf 1',
                'import-route static'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'ospf 1',
                    'import-route static',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'R1 must be redistributing static routes',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        return !!r1?.ospfEnabled;
                    },
                    errorMessage: 'Route importation has not been configured on R1'
                }
            ],
            points: 30
        }
    ],
    rewards: {
        stars: 3,
        experience: 350,
        badges: ['route-importer', 'interop-specialist']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
