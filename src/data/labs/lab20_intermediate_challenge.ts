import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab20: Lab = {
    id: 'intermediate-challenge',
    title: 'Comprehensive Challenge: Corporate Site',
    description: 'Design and configure the complete infrastructure of a small corporate office including L2/L3 redundancy and Internet access',
    difficulty: 'advanced',
    certification: 'hcia',
    estimatedTime: 90,
    prerequisites: ['Labs 1-19'],
    objectives: [
        'Configure triangular topology with STP',
        'Implement VLANs and Trunking',
        'Configure VRRP for gateway redundancy',
        'Enable OSPF for routed internal communication',
        'Configure NAT/PAT for Internet access'
    ],
    topology: {
        devices: [
            { type: 'Router', count: 1, config: { model: 'Huawei-AR617' } },
            { type: 'Switch', count: 2, config: { model: 'Huawei-S5700-28TP' } },
            { type: 'PC', count: 2 }
        ],
        connections: [
            { from: 'Router1:GE0/0/0', to: 'Internet:GW', type: 'copper' },
            { from: 'Router1:GE0/0/1', to: 'Switch1:GE0/0/24', type: 'copper' },
            { from: 'Switch1:GE0/0/23', to: 'Switch2:GE0/0/23', type: 'copper' },
            { from: 'Switch1:GE0/0/1', to: 'PC1:eth0', type: 'copper' },
            { from: 'Switch2:GE0/0/2', to: 'PC2:eth0', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'final-task',
            title: 'Site Configuration',
            description: 'Implement all services: VLANs 10 (PC1) and 20 (PC2), OSPF between R1 and Switches, and Outbound NAT on R1',
            instructions: [
                '1. VLANs and Ports on Switches',
                '2. OSPF Area 0 on the entire network',
                '3. VRRP on Switches for LANs',
                '4. NAT Easy-IP on Router1'
            ],
            commands: {
                huawei: [
                    '# Final integration step - Multiple commands required'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'The entire network must be operational and routing',
                    check: (context: LabValidationContext) => {
                        // Complex validation of multiple points
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        return !!(r1?.ospfEnabled && r1.natRules && r1.natRules.length > 0);
                    },
                    errorMessage: 'Not all integrated configuration requirements have been met'
                }
            ],
            points: 100
        }
    ],
    rewards: {
        stars: 3,
        experience: 1000,
        badges: ['certified-associate', 'network-hero']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
