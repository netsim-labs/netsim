import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab24: Lab = {
    id: 'port-security-sticky',
    title: 'Port Security (Sticky MAC)',
    description: 'Secure your access infrastructure by allowing only authorized devices to connect, using port security with persistent learning',
    difficulty: 'intermediate',
    certification: 'hcia',
    estimatedTime: 35,
    prerequisites: ['Lab 1: Basic Campus LAN'],
    objectives: [
        'Enable port-security on access interfaces',
        'Configure sticky learning method',
        'Establish a maximum limit of MAC addresses',
        'Define violation action (Protect/Restrict/Shutdown)'
    ],
    topology: {
        devices: [
            { type: 'Switch', count: 1, config: { model: 'Huawei-S5700-28TP' } },
            { type: 'PC', count: 2 }
        ],
        connections: [
            { from: 'Switch1:GE0/0/1', to: 'PC1:eth0', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'enable-security',
            title: 'Enable Security on GE1',
            description: 'Enable port-security in sticky mode on interface GE0/0/1',
            instructions: [
                'interface GigabitEthernet 0/0/1',
                'port-security enable',
                'port-security mac-address sticky',
                'port-security max-mac-num 1'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'interface GigabitEthernet 0/0/1',
                    'port-security enable',
                    'port-security mac-address sticky',
                    'port-security max-mac-num 1',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Security active on GE1 with 1 MAC limit',
                    check: (context: LabValidationContext) => {
                        const sw1 = context.devices.find(d => d.hostname === 'Switch1');
                        const port = sw1?.ports.find(p => p.name.includes('0/0/1'));
                        return !!port?.config.portSecurity;
                    },
                    errorMessage: 'Port security has not been activated correctly'
                }
            ],
            points: 30
        }
    ],
    rewards: {
        stars: 3,
        experience: 250,
        badges: ['access-guard', 'mac-protector']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
