import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab10: Lab = {
    id: 'router-on-a-stick',
    title: 'Inter-VLAN Routing (Router-on-a-Stick)',
    description: 'Configure a router to communicate multiple VLANs using subinterfaces and a trunk link',
    difficulty: 'basic',
    certification: 'hcia',
    estimatedTime: 60,
    prerequisites: ['Lab 1: Basic Campus LAN', 'Lab 10: VLANs & Trunking'],
    objectives: [
        'Configure trunk links between switches and router',
        'Create subinterfaces on the router',
        'Configure dot1q encapsulation',
        'Verify communication between different VLAN networks'
    ],
    topology: {
        devices: [
            { type: 'Router', count: 1, config: { model: 'Huawei-AR617' } },
            { type: 'Switch', count: 1, config: { model: 'Huawei-S5700-28TP' } },
            { type: 'PC', count: 2 }
        ],
        connections: [
            { from: 'Router1:GE0/0/0', to: 'Switch1:GE0/0/24', type: 'copper' },
            { from: 'Switch1:GE0/0/1', to: 'PC1:eth0', type: 'copper' },
            { from: 'Switch1:GE0/0/2', to: 'PC2:eth0', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'switch-trunk',
            title: 'Configure Trunk on Switch',
            description: 'Configure GE0/0/24 as trunk to allow VLANs 10 and 20',
            instructions: [
                'interface GigabitEthernet 0/0/24',
                'port link-type trunk',
                'port trunk allow-pass vlan 10 20'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'interface GigabitEthernet 0/0/24',
                    'port link-type trunk',
                    'port trunk allow-pass vlan 10 20',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'GE24 must be trunk with VLANs 10 and 20 allowed',
                    check: (context: LabValidationContext) => {
                        const sw1 = context.devices.find(d => d.hostname === 'Switch1');
                        const port = sw1?.ports.find(p => p.id === 'GE0/0/24' || p.name.includes('0/0/24'));
                        return !!(port?.config.mode === 'trunk' && port.config.allowedVlans?.includes(10) && port.config.allowedVlans?.includes(20));
                    },
                    errorMessage: 'Port GE0/0/24 on switch is not configured correctly as trunk'
                }
            ],
            points: 20
        },
        {
            id: 'router-subinterfaces',
            title: 'Subinterfaces on Router',
            description: 'Configure subinterfaces on GE0/0/0 for VLANs 10 and 20',
            instructions: [
                'interface GigabitEthernet 0/0/0.10',
                'dot1q termination vid 10',
                'ip address 192.168.10.1 24',
                'arp broadcast enable',
                'Repeat for VLAN 20 (.20)'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'interface GigabitEthernet 0/0/0.10',
                    'dot1q termination vid 10',
                    'ip address 192.168.10.1 24',
                    'arp broadcast enable',
                    'quit',
                    'interface GigabitEthernet 0/0/0.20',
                    'dot1q termination vid 20',
                    'ip address 192.168.20.1 24',
                    'arp broadcast enable',
                    'quit',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Subinterfaces configured correctly',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const p10 = r1?.ports.find(p => p.name === 'GigabitEthernet0/0/0.10');
                        const p20 = r1?.ports.find(p => p.name === 'GigabitEthernet0/0/0.20');
                        return p10?.config.ipAddress === '192.168.10.1' && p20?.config.ipAddress === '192.168.20.1';
                    },
                    errorMessage: 'Subinterfaces on Router1 do not have correct IP or encapsulation'
                }
            ],
            points: 40
        }
    ],
    rewards: {
        stars: 3,
        experience: 300,
        badges: ['trunk-king', 'subinterface-pro']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
