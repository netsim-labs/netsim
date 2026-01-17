import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab30: Lab = {
    id: 'expert-final-exam',
    title: 'Final Exam: Enterprise Infrastructure',
    description: 'The ultimate challenge. Build and secure a multi-site enterprise network with advanced dynamic routing and total redundancy.',
    difficulty: 'advanced',
    certification: 'hcie',
    estimatedTime: 120,
    prerequisites: ['Labs 1-29'],
    objectives: [
        'Implement redundant Core with MSTP and VRRP',
        'Configure Multi-area OSPF between sites',
        'Secure access with Port Security and ACLs',
        'Optimize traffic with QoS and LACP',
        'Publish services with NAT Server and secure with basic Firewall'
    ],
    topology: {
        devices: [
            { type: 'Router', count: 2, config: { model: 'Huawei-AR617' } },
            { type: 'Switch', count: 4, config: { model: 'Huawei-S5700-28TP' } },
            { type: 'PC', count: 2 }
        ],
        connections: [
            { from: 'Router1:GE0/0/0', to: 'Router2:GE0/0/0', type: 'copper' }, // Enlace entre sedes
            { from: 'Router1:GE0/0/1', to: 'Switch1:GE0/0/24', type: 'copper' },
            { from: 'Router2:GE0/0/1', to: 'Switch3:GE0/0/24', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'expert-task',
            title: 'Complete Configuration',
            description: 'Carry out the implementation following the attached enterprise network design.',
            instructions: [
                '1. Configure L2 mesh with MSTP on switches at each site.',
                '2. Implement OSPF Area 0 for the backbone and Area 1/2 for sites.',
                '3. Configure NAT Server on R1 for the internal server.',
                '4. Secure all access ports.'
            ],
            commands: {
                huawei: [
                    '# FINAL EXAM - REQUIRES COMPLETE IMPLEMENTATION'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'The network must be 100% functional and secure',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        return !!(r1?.ospfEnabled && r1.natRules && r1.natRules.length > 0);
                    },
                    errorMessage: 'There are still flaws in the configured infrastructure'
                }
            ],
            points: 200
        }
    ],
    rewards: {
        stars: 5,
        experience: 5000,
        badges: ['certified-expert', 'network-god', 'architect-extraordinaire']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
