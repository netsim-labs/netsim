import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab17: Lab = {
    id: 'stp-root-guard',
    title: 'STP Security: Root Guard',
    description: 'Protect the stability of your Layer 2 network by preventing unauthorized switches from becoming the Root Bridge',
    difficulty: 'intermediate',
    certification: 'hcia',
    estimatedTime: 30,
    prerequisites: ['Lab 12: RSTP and Port Protection'],
    objectives: [
        'Identify critical edge interfaces',
        'Configure Root Guard',
        'Simulate an STP priority attack',
        'Verify that the port enters a protective blocking state'
    ],
    topology: {
        devices: [
            { type: 'Switch', count: 2, config: { model: 'Huawei-S5700-28TP' } }
        ],
        connections: [
            { from: 'Switch1:GE0/0/24', to: 'Switch2:GE0/0/24', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'root-guard-enable',
            title: 'Enable Root Guard',
            description: 'Enable Root Guard on the Switch1 port that connects to Switch2 to protect its Root role',
            instructions: [
                'On SW1, interface GigabitEthernet 0/0/24',
                'stp root-protection'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'interface GigabitEthernet 0/0/24',
                    'stp root-protection',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Root protection must be active on GE24',
                    check: (context: LabValidationContext) => {
                        const sw1 = context.devices.find(d => d.hostname === 'Switch1');
                        const port = sw1?.ports.find(p => p.name.includes('0/0/24'));
                        return !!port?.config.loopGuard; // Reusing loopGuard as generic protection flag in this version
                    },
                    errorMessage: 'Root Guard has not been enabled on the interface'
                }
            ],
            points: 25
        }
    ],
    rewards: {
        stars: 3,
        experience: 200,
        badges: ['stp-shield', 'root-protector']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
