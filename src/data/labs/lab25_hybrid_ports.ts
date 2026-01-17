import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab25: Lab = {
    id: 'huawei-hybrid-ports',
    title: 'Huawei Hybrid Ports',
    description: 'Explore the unique flexibility of hybrid ports to allow multiple VLANs both tagged and untagged on the same interface',
    difficulty: 'advanced',
    certification: 'hcia',
    estimatedTime: 40,
    prerequisites: ['Lab 1: Basic Campus LAN', 'Lab 10: Inter-VLAN Advanced'],
    objectives: [
        'Configure link mode to hybrid',
        'Define port PVID',
        'Allow multiple untagged VLANs for simple communication',
        'Allow tagged VLANs for trunk transport'
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
            id: 'hybrid-config',
            title: 'Configure GE1 as Hybrid',
            description: 'Configure GE0/0/1 to be untagged in VLAN 10 and tagged in VLAN 20',
            instructions: [
                'interface GigabitEthernet 0/0/1',
                'port link-type hybrid',
                'port hybrid pvid vlan 10',
                'port hybrid untagged vlan 10',
                'port hybrid tagged vlan 20'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'interface GigabitEthernet 0/0/1',
                    'port link-type hybrid',
                    'port hybrid pvid vlan 10',
                    'port hybrid untagged vlan 10',
                    'port hybrid tagged vlan 20',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'GE1 must be in hybrid mode',
                    check: (context: LabValidationContext) => {
                        const sw1 = context.devices.find(d => d.hostname === 'Switch1');
                        const port = sw1?.ports.find(p => p.name.includes('0/0/1'));
                        return port?.config.mode === 'hybrid';
                    },
                    errorMessage: 'The port has not been configured in hybrid mode'
                }
            ],
            points: 40
        }
    ],
    rewards: {
        stars: 3,
        experience: 300,
        badges: ['hybrid-master', 'vlan-wizard']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
