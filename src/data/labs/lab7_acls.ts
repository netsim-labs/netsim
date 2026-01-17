import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab7: Lab = {
    id: 'acl-basics',
    title: 'Access Control with ACLs',
    description: 'Learn to filter traffic and protect your networks using Access Control Lists (ACLs)',
    difficulty: 'basic',
    certification: 'hcia',
    estimatedTime: 40,
    prerequisites: ['Lab 4: Static Inter-area Routing'],
    objectives: [
        'Create a basic ACL',
        'Define deny and permit rules',
        'Apply the ACL to a router interface',
        'Verify traffic filtering'
    ],
    topology: {
        devices: [
            { type: 'Router', count: 1, config: { model: 'Huawei-AR617' } },
            { type: 'PC', count: 2 }
        ],
        connections: [
            { from: 'Router1:GE0/0/1', to: 'PC1:eth0', type: 'copper' },
            { from: 'Router1:GE0/0/2', to: 'PC2:eth0', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'create-acl',
            title: 'Create ACL 2000',
            description: 'Define a basic ACL to deny traffic from PC1 (192.168.1.10)',
            instructions: [
                'Use acl 2000',
                'Rule: rule deny source 192.168.1.10 0',
                'Allow the rest: rule permit source any'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'acl 2000',
                    'rule deny source 192.168.1.10 0',
                    'rule permit source any',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'ACL 2000 must exist with the correct rules',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        // AclRule is flat in the array, not a containter with 'rules'
                        const denyRule = r1?.aclRules?.find(a => (a.id === '2000' || a.name === '2000') && a.action === 'deny' && a.source === '192.168.1.10');
                        return !!denyRule;
                    },
                    errorMessage: 'ACL 2000 is not configured correctly'
                }
            ],
            points: 25
        }
    ],
    rewards: {
        stars: 3,
        experience: 200,
        badges: ['firewall-trainee', 'traffic-filterer']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
