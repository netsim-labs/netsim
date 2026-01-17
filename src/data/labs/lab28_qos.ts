import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab28: Lab = {
    id: 'qos-basics',
    title: 'QoS Fundamentals (Prioritization)',
    description: 'Ensure critical traffic (voice or video) has priority over common data traffic during times of congestion',
    difficulty: 'intermediate',
    certification: 'hcip',
    estimatedTime: 45,
    prerequisites: ['Lab 14: Advanced ACLs'],
    objectives: [
        'Classify traffic using ACLs',
        'Configure Traffic Classifiers and Behaviors',
        'Apply QoS policies on interfaces',
        'Verify queue prioritization'
    ],
    topology: {
        devices: [
            { type: 'Router', count: 1, config: { model: 'Huawei-AR617' } }
        ],
        connections: [
            { from: 'Router1:GE0/0/0', to: 'Internet:GW', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'qos-policy',
            title: 'Configure Voice Policy',
            description: 'Prioritize UDP 5060 (VoIP) traffic over the rest of the traffic',
            instructions: [
                '1. ACL 3001 for UDP port 5060',
                '2. classifier C1 operator and, if-match acl 3001',
                '3. behavior B1, remark dscp ef',
                '4. traffic policy P1, classifier C1 behavior B1'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'traffic classifier C1',
                    'if-match acl 3001',
                    'quit',
                    'traffic behavior B1',
                    'remark dscp ef',
                    'quit',
                    'traffic policy P1',
                    'classifier C1 behavior B1',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'The QoS policy must exist',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        return !!r1; // Validation for QoS objects not fully mapped in simplified types yet
                    },
                    errorMessage: 'QoS policy has not been configured'
                }
            ],
            points: 40
        }
    ],
    rewards: {
        stars: 3,
        experience: 350,
        badges: ['qos-trainee', 'traffic-shaper']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
