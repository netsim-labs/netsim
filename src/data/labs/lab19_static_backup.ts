import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab19: Lab = {
    id: 'floating-static-route',
    title: 'Floating Static Route (Backup)',
    description: 'Configure automatic backup routes using different administrative distances to ensure connectivity in case of link failure',
    difficulty: 'intermediate',
    certification: 'hcia',
    estimatedTime: 40,
    prerequisites: ['Lab 4: Static Inter-area Routing'],
    objectives: [
        'Configure multiple routes to same destination',
        'Adjust static routing "preference" value',
        'Validate active vs hidden backup route',
        'Simulate link failure and observe routing changes'
    ],
    topology: {
        devices: [
            { type: 'Router', count: 2, config: { model: 'Huawei-AR617' } }
        ],
        connections: [
            { from: 'Router1:GE0/0/0', to: 'Router2:GE0/0/0', type: 'copper' },
            { from: 'Router1:GE0/0/1', to: 'Router2:GE0/0/1', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'configure-floating',
            title: 'Configure Backup Route',
            description: 'Configure a route to 192.168.2.0/24 via GE0/0/1 with preference 100',
            instructions: [
                'Primary route: ip route-static 192.168.2.0 24 10.0.0.2 (Pref 60)',
                'Backup route: ip route-static 192.168.2.0 24 10.0.1.2 preference 100'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'ip route-static 192.168.2.0 255.255.255.0 10.0.0.2',
                    'ip route-static 192.168.2.0 255.255.255.0 10.0.1.2 preference 100',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Two static routes must exist with different preferences',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const routes = r1?.routingTable?.filter(r => r.destination === '192.168.2.0');
                        return (routes?.length || 0) >= 2;
                    },
                    errorMessage: 'Both static routes have not been configured'
                }
            ],
            points: 40
        }
    ],
    rewards: {
        stars: 3,
        experience: 250,
        badges: ['redundant-router', 'backup-master']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
