import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab9: Lab = {
    id: 'dynamic-nat-pat',
    title: 'Dynamic NAT and PAT (Easy IP)',
    description: 'Allow multiple devices in your LAN to share a single public IP address to access the Internet',
    difficulty: 'basic',
    certification: 'hcia',
    estimatedTime: 45,
    prerequisites: ['Lab 7: Access Control with ACLs', 'Lab 8: Address Translation (NAT)'],
    objectives: [
        'Configure an ACL to identify internal traffic',
        'Configure NAT Easy IP on the outbound interface',
        'Verify active NAT sessions',
        'Test concurrent browsing from several PCs'
    ],
    topology: {
        devices: [
            { type: 'Router', count: 1, config: { model: 'Huawei-AR617' } },
            { type: 'Switch', count: 1, config: { model: 'Huawei-S5700-28TP' } },
            { type: 'PC', count: 2 }
        ],
        connections: [
            { from: 'Router1:GE0/0/0', to: 'Internet:GW', type: 'copper' },
            { from: 'Router1:GE0/0/1', to: 'Switch1:GE0/0/24', type: 'copper' },
            { from: 'Switch1:GE0/0/1', to: 'PC1:eth0', type: 'copper' },
            { from: 'Switch1:GE0/0/2', to: 'PC2:eth0', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'create-nat-acl',
            title: 'Create NAT Traffic ACL',
            description: 'Create ACL 2001 to allow the LAN network 192.168.10.0/24',
            instructions: [
                'Use acl 2001',
                'Rule: rule permit source 192.168.10.0 0.0.0.255'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'acl 2001',
                    'rule permit source 192.168.10.0 0.0.0.255',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'ACL 2001 must allow the LAN network',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const rule = r1?.aclRules?.find(a => a.id === '2001' && a.action === 'permit' && a.source === '192.168.10.0');
                        return !!rule;
                    },
                    errorMessage: 'ACL 2001 is not configured for the 192.168.10.0/24 network'
                }
            ],
            points: 20
        },
        {
            id: 'apply-easy-ip',
            title: 'Configure Easy IP',
            description: 'Apply outbound NAT on the WAN interface using ACL 2001',
            instructions: [
                'Enter interface GigabitEthernet 0/0/0',
                'Use nat outbound 2001'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'interface GigabitEthernet 0/0/0',
                    'nat outbound 2001',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Outbound NAT must be applied on GE0/0/0',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        // 'dynamic' corresponds to outbound/Easy-IP in this model
                        return !!r1?.natRules?.find(n => n.type === 'dynamic' && n.id === '2001' && n.interfaceId === 'GigabitEthernet0/0/0');
                    },
                    errorMessage: 'Outbound NAT is not configured on the WAN interface'
                }
            ],
            points: 30
        }
    ],
    rewards: {
        stars: 3,
        experience: 250,
        badges: ['pat-expert', 'connectivity-ninja']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
