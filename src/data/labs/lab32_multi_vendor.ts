import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab32: Lab = {
    id: 'multi-vendor-interop',
    title: 'Multi-Vendor Interoperability',
    description: 'Configure basic connectivity in a mixed network with Huawei, Cisco, Aruba and MikroTik.',
    difficulty: 'advanced',
    certification: 'hcip',
    estimatedTime: 45,
    prerequisites: ['VLANs', 'Static Routing'],
    objectives: [
        'Configure interfaces on 4 different vendors',
        'Validate usage of different CLIs',
        'Achieve end-to-end ping'
    ],
    topology: {
        devices: [
            { type: 'Router', count: 1, config: { model: 'MikroTik-CCR2004', hostname: 'ISP-Core' } },
            { type: 'Switch', count: 1, config: { model: 'Aruba-CX-6300', hostname: 'Aruba-Agg' } },
            { type: 'Switch', count: 1, config: { model: 'Cisco-Catalyst-9300', hostname: 'Cisco-Acc' } },
            { type: 'Switch', count: 1, config: { model: 'Huawei-S5700-28TP', hostname: 'Huawei-Access' } }
        ],
        connections: [
            { from: 'ISP-Core:XGE0/0/1', to: 'Aruba-Agg:XGE0/0/1', type: 'fiber' },
            { from: 'Aruba-Agg:XGE0/0/2', to: 'Cisco-Acc:GE0/0/24', type: 'copper' },
            { from: 'Aruba-Agg:XGE0/0/3', to: 'Huawei-Access:GE0/0/24', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'mikrotik-setup',
            title: 'MikroTik Configuration',
            description: 'Use the MikroTik CLI to assign IP.',
            instructions: [
                'In ISP-Core, use "/ip address add address=10.0.0.1/24 interface=ether1"',
                'Verify with "/ip address print"'
            ],
            commands: {
                huawei: [
                    '/ip address add address=10.0.0.1/24 interface=ether1',
                    '/ip address print'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Interface ether1 must have IP 10.0.0.1',
                    check: (context: LabValidationContext) => {
                        const mk = context.devices.find(d => d.hostname === 'ISP-Core');
                        const port = mk?.ports.find(p => p.name.includes('0/0/1') || p.name === 'ether1');
                        return port?.config.ipAddress === '10.0.0.1';
                    },
                    errorMessage: 'The IP is not configured on the MikroTik.'
                }
            ],
            points: 25
        },
        {
            id: 'aruba-setup',
            title: 'Aruba CX Configuration',
            description: 'Configure the uplink interface towards the ISP.',
            instructions: [
                'In Aruba-Agg, enter "conf t"',
                'Interface 1/1/1',
                'No routing',
                'Ip address 10.0.0.2/24'
            ],
            commands: {
                huawei: [
                    'configure terminal',
                    'interface 1/1/1',
                    'no shutdown',
                    'ip address 10.0.0.2/24'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Aruba must have IP 10.0.0.2',
                    check: (context: LabValidationContext) => {
                        const ar = context.devices.find(d => d.hostname === 'Aruba-Agg');
                        const port = ar?.ports.find(p => p.name.includes('0/0/1'));
                        return port?.config.ipAddress === '10.0.0.2';
                    },
                    errorMessage: 'The IP is not configured on the Aruba switch.'
                }
            ],
            points: 25
        }
    ],
    rewards: {
        stars: 3,
        experience: 500,
        badges: ['multi-vendor-guru', 'cli-polyglot']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
