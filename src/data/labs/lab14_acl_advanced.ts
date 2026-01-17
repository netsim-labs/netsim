import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab14: Lab = {
    id: 'acl-advanced',
    title: 'Advanced ACLs (TCP/UDP)',
    description: 'Control your network traffic precisely by filtering by protocol port (HTTP, Telnet, ICMP)',
    difficulty: 'intermediate',
    certification: 'hcia',
    estimatedTime: 45,
    prerequisites: ['Lab 7: Basic ACLs'],
    objectives: [
        'Differentiate between basic and advanced ACLs',
        'Block specific traffic (e.g., Telnet)',
        'Allow selective traffic (e.g., HTTP)',
        'Apply filters in the correct direction'
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
            id: 'create-adv-acl',
            title: 'Create Advanced ACL 3000',
            description: 'Allow HTTP traffic and deny Telnet from PC1 (192.168.1.10)',
            instructions: [
                'Use acl 3000',
                'Allow HTTP: rule permit tcp source 192.168.1.10 0 destination any destination-port eq 80',
                'Deny Telnet: rule deny tcp source 192.168.1.10 0 destination any destination-port eq 23'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'acl 3000',
                    'rule permit tcp source 192.168.1.10 0 destination any destination-port eq 80',
                    'rule deny tcp source 192.168.1.10 0 destination any destination-port eq 23',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'ACL 3000 must have TCP port rules',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const rules = r1?.aclRules?.filter(a => a.id === '3000' || a.name === '3000');
                        const hasHttp = rules?.some(r => r.action === 'permit' && r.dstPort === 80);
                        const hasTelnet = rules?.some(r => r.action === 'deny' && r.dstPort === 23);
                        return !!(hasHttp && hasTelnet);
                    },
                    errorMessage: 'ACL 3000 does not have the correct port rules'
                }
            ],
            points: 30
        }
    ],
    rewards: {
        stars: 3,
        experience: 250,
        badges: ['security-analyst', 'protocol-filterer']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
