import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab3: Lab = {
    id: 'lacp-bundling',
    title: 'Link Aggregation (LACP)',
    description: 'Increase bandwidth and fault tolerance by bundling physical interfaces into an Eth-Trunk',
    difficulty: 'basic',
    certification: 'hcia',
    estimatedTime: 35,
    prerequisites: ['Lab 1: Campus LAN Basic'],
    objectives: [
        'Create a logical Eth-Trunk interface',
        'Configure LACP mode',
        'Add physical interfaces to the group',
        'Verify trunk status'
    ],
    topology: {
        devices: [
            { type: 'Switch', count: 2, config: { model: 'Huawei-S5700-28TP' } }
        ],
        connections: [
            { from: 'Switch1:GE0/0/23', to: 'Switch2:GE0/0/23', type: 'copper' },
            { from: 'Switch1:GE0/0/24', to: 'Switch2:GE0/0/24', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'create-eth-trunk',
            title: 'Create Eth-Trunk',
            description: 'Create logical interface Eth-Trunk 1 on both switches',
            instructions: [
                'Use interface Eth-Trunk 1',
                'Set mode to lacp (mode lacp-static)',
                'Repeat on both switches'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'interface Eth-Trunk 1',
                    'mode lacp-static',
                    'quit',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Eth-Trunk 1 must exist and be in lacp mode',
                    check: (context: LabValidationContext) => {
                        return context.devices.every(d => {
                            const trunk = d.ethTrunks?.find(t => t.name === 'Eth-Trunk 1' || t.id === '1');
                            return trunk ? trunk.mode === 'lacp' : false;
                        });
                    },
                    errorMessage: 'Eth-Trunk 1 is not correctly configured in LACP mode'
                }
            ],
            points: 20
        },
        {
            id: 'add-members',
            title: 'Add Members',
            description: 'Associate interfaces GE0/0/23 and GE0/0/24 to Eth-Trunk 1',
            instructions: [
                'Enter each physical interface',
                'Use eth-trunk 1 to associate it',
                'Verify with display eth-trunk 1'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'interface GigabitEthernet 0/0/23',
                    'eth-trunk 1',
                    'quit',
                    'interface GigabitEthernet 0/0/24',
                    'eth-trunk 1',
                    'quit',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'GE23 and GE24 must be members of Eth-Trunk 1',
                    check: (context: LabValidationContext) => {
                        return context.devices.every(d => {
                            const trunk = d.ethTrunks?.find(t => t.name === 'Eth-Trunk 1' || t.id === '1');
                            if (!trunk) return false;
                            // Search IDs for ports GE23 and GE24 on this device
                            const p23 = d.ports.find(p => p.name.includes('0/0/23'))?.id;
                            const p24 = d.ports.find(p => p.name.includes('0/0/24'))?.id;
                            return trunk.members.includes(p23!) && trunk.members.includes(p24!);
                        });
                    },
                    errorMessage: 'Physical ports have not been correctly added to the Eth-Trunk'
                }
            ],
            points: 30
        }
    ],
    rewards: {
        stars: 3,
        experience: 150,
        badges: ['link-aggregator', 'bandwidth-booster']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
