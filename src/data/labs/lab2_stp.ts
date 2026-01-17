import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab2: Lab = {
    id: 'stp-basics',
    title: 'L2 Redundancy with STP',
    description: 'Learn to avoid loops in a redundant topology using Spanning Tree Protocol',
    difficulty: 'basic',
    certification: 'hcia',
    estimatedTime: 40,
    prerequisites: ['Lab 1: Basic Campus LAN', 'L2 Loop Concepts'],
    objectives: [
        'Verify STP status',
        'Change Bridge Root priority',
        'Identify blocked ports',
        'Observe convergence after a failure'
    ],
    topology: {
        devices: [
            { type: 'Switch', count: 3, config: { model: 'Huawei-S5700-28TP' } }
        ],
        connections: [
            { from: 'Switch1:GE0/0/23', to: 'Switch2:GE0/0/23', type: 'copper' },
            { from: 'Switch2:GE0/0/24', to: 'Switch3:GE0/0/24', type: 'copper' },
            { from: 'Switch3:GE0/0/1', to: 'Switch1:GE0/0/1', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'stp-enable',
            title: 'Enable STP',
            description: 'Ensure STP is enabled on all switches',
            instructions: [
                'On each switch, use stp enable',
                'Set mode to stp (Legacy)',
                'Verify with display stp'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'stp enable',
                    'stp mode stp',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'STP must be enabled and in stp mode',
                    check: (context: LabValidationContext) => {
                        return context.devices.every(d => d.stpEnabled && d.stpMode === 'stp');
                    },
                    errorMessage: 'Not all switches have STP enabled in stp mode'
                }
            ],
            points: 20
        },
        {
            id: 'configure-root',
            title: 'Configure Root Bridge',
            description: 'Make Switch1 the Root Bridge of the topology',
            instructions: [
                'On Switch1, set STP priority to 0',
                'Verify that Switch1 is the root with display stp'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'stp priority 0',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Switch1 must have the lowest priority',
                    check: (context: LabValidationContext) => {
                        const sw1 = context.devices.find(d => d.hostname === 'Switch1');
                        return sw1 ? sw1.stpPriority === 0 : false;
                    },
                    errorMessage: 'Switch1 does not have priority 0 configured'
                }
            ],
            points: 30
        }
    ],
    rewards: {
        stars: 3,
        experience: 150,
        badges: ['stp-master', 'loop-preventer']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
