import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab12: Lab = {
    id: 'rstp-portfast',
    title: 'RSTP and Port Protection',
    description: 'Improve Spanning Tree convergence speed and protect access ports against accidental loops',
    difficulty: 'basic',
    certification: 'hcia',
    estimatedTime: 35,
    prerequisites: ['Lab 2: Redundancia L2 con STP'],
    objectives: [
        'Enable Rapid Spanning Tree (RSTP)',
        'Configure Edge Ports',
        'Enable BPDU Guard for security',
        'Verify port status'
    ],
    topology: {
        devices: [
            { type: 'Switch', count: 1, config: { model: 'Huawei-S5700-28TP' } },
            { type: 'PC', count: 2 }
        ],
        connections: [
            { from: 'Switch1:GE0/0/1', to: 'PC1:eth0', type: 'copper' },
            { from: 'Switch1:GE0/0/2', to: 'PC2:eth0', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'rstp-enable',
            title: 'Enable RSTP',
            description: 'Change STP mode to RSTP on the switch',
            instructions: [
                'Use stp mode rstp',
                'Verify with display stp brief'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'stp mode rstp',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'The switch must be in RSTP mode',
                    check: (context: LabValidationContext) => {
                        const sw1 = context.devices.find(d => d.hostname === 'Switch1');
                        return sw1?.stpMode === 'rstp';
                    },
                    errorMessage: 'The switch is not configured in RSTP mode'
                }
            ],
            points: 20
        },
        {
            id: 'edge-port-security',
            title: 'Configure Edge Ports and BPDU Guard',
            description: 'Configure ports towards PCs as Edge Ports and enable BPDU Guard globally',
            instructions: [
                'In ports GE0/0/1 and GE0/0/2: stp edged-port enable',
                'Globally: stp bpdu-protection'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'interface GigabitEthernet 0/0/1',
                    'stp edged-port enable',
                    'quit',
                    'interface GigabitEthernet 0/0/2',
                    'stp edged-port enable',
                    'quit',
                    'stp bpdu-protection',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Ports GE1 and GE2 must be edged-port',
                    check: (context: LabValidationContext) => {
                        const sw1 = context.devices.find(d => d.hostname === 'Switch1');
                        const p1 = sw1?.ports.find(p => p.name.includes('0/0/1'));
                        const p2 = sw1?.ports.find(p => p.name.includes('0/0/2'));
                        return !!(p1?.config.portFast && p2?.config.portFast);
                    },
                    errorMessage: 'Ports are not correctly configured as Edge Ports'
                }
            ],
            points: 40
        }
    ],
    rewards: {
        stars: 3,
        experience: 200,
        badges: ['rstp-pro', 'edge-guardian']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
