import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab27: Lab = {
    id: 'mstp-instances',
    title: 'Load Balancing with MSTP',
    description: 'Learn to balance traffic from different VLANs through multiple physical links using MSTP instances',
    difficulty: 'advanced',
    certification: 'hcip',
    estimatedTime: 50,
    prerequisites: ['Lab 12: RSTP and Port Protection'],
    objectives: [
        'Configure MSTP region',
        'Assign VLANs to different instances',
        'Define different Root Bridges per instance',
        'Optimize the use of redundant links'
    ],
    topology: {
        devices: [
            { type: 'Switch', count: 3, config: { model: 'Huawei-S5700-28TP' } }
        ],
        connections: [
            { from: 'Switch1:GE0/0/23', to: 'Switch2:GE0/0/23', type: 'copper' },
            { from: 'Switch2:GE0/0/24', to: 'Switch3:GE0/0/24', type: 'copper' },
            { from: 'Switch3:GE0/0/24', to: 'Switch1:GE0/0/24', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'mstp-region',
            title: 'Configure MSTP Region',
            description: 'Configure region name "REGION1" and map VLAN 10 to Instance 1',
            instructions: [
                'stp region-configuration',
                'region-name REGION1',
                'instance 1 vlan 10',
                'active region-configuration'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'stp region-configuration',
                    'region-name REGION1',
                    'instance 1 vlan 10',
                    'active region-configuration',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'The switch must be in MSTP mode and with region configured',
                    check: (context: LabValidationContext) => {
                        const sw1 = context.devices.find(d => d.hostname === 'Switch1');
                        return sw1?.stpMode === 'mstp';
                    },
                    errorMessage: 'MSTP has not been configured correctly'
                }
            ],
            points: 35
        }
    ],
    rewards: {
        stars: 3,
        experience: 450,
        badges: ['stp-expert', 'l2-load-balancer']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
