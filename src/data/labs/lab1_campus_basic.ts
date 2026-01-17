import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab1: Lab = {
    id: 'campus-basic',
    title: 'Basic Campus LAN',
    description: 'Configure VLANs, trunking, and basic connectivity between switches and PCs',
    difficulty: 'basic',
    certification: 'hcia',
    estimatedTime: 30,
    prerequisites: ['Basic networking knowledge', 'Familiarity with VLANs'],
    objectives: [
        'Create and configure VLANs',
        'Assign ports to VLANs',
        'Configure VLAN interfaces',
        'Verify inter-VLAN connectivity'
    ],
    topology: {
        devices: [
            { type: 'Switch', count: 1, config: { model: 'Huawei-S5700-28TP' } },
            { type: 'PC', count: 2 }
        ],
        connections: [
            { from: 'Switch:GE0/0/1', to: 'PC1:eth0', type: 'copper' },
            { from: 'Switch:GE0/0/2', to: 'PC2:eth0', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'create-vlans',
            title: 'Create VLANs',
            description: 'Create VLANs 10 and 20 to segment the network',
            instructions: [
                'Enter system-view mode',
                'Create VLAN 10 named VLAN_10',
                'Create VLAN 20 named VLAN_20',
                'Verify with display vlan'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'vlan 10',
                    'name VLAN_10',
                    'quit',
                    'vlan 20',
                    'name VLAN_20',
                    'quit',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'VLANs 10 and 20 must exist',
                    check: (context: LabValidationContext) => {
                        const switchDevice = context.devices.find(d => d.model.includes('Switch'));
                        return switchDevice ? switchDevice.vlans.includes(10) && switchDevice.vlans.includes(20) : false;
                    },
                    errorMessage: 'VLANs 10 and 20 are not configured correctly'
                }
            ],
            hints: [
                'Use the command "vlan X" to create VLANs',
                'Do not forget to exit each VLAN with "quit"'
            ],
            points: 20
        },
        {
            id: 'configure-access-ports',
            title: 'Configure Access Ports',
            description: 'Assign ports to VLANs in access mode',
            instructions: [
                'Configure GE0/0/1 as access vlan 10',
                'Configure GE0/0/2 as access vlan 20',
                'Verify port configuration'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'interface GigabitEthernet 0/0/1',
                    'port link-type access',
                    'port default vlan 10',
                    'quit',
                    'interface GigabitEthernet 0/0/2',
                    'port link-type access',
                    'port default vlan 20',
                    'quit',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Ports must be in access mode with correct VLANs',
                    check: (context: LabValidationContext) => {
                        const switchDevice = context.devices.find(d => d.model.includes('Switch'));
                        if (!switchDevice) return false;

                        const port1 = switchDevice.ports.find(p => p.name.includes('0/0/1'));
                        const port2 = switchDevice.ports.find(p => p.name.includes('0/0/2'));

                        return port1?.config.mode === 'access' && port1.config.vlan === 10 &&
                            port2?.config.mode === 'access' && port2.config.vlan === 20;
                    },
                    errorMessage: 'Ports are not correctly configured as access'
                }
            ],
            points: 25
        },
        {
            id: 'configure-pcs',
            title: 'Configure PCs',
            description: 'Assign IPs to PCs in their respective VLANs',
            instructions: [
                'PC1: IP 192.168.10.10/24, Gateway 192.168.10.1',
                'PC2: IP 192.168.20.10/24, Gateway 192.168.20.1'
            ],
            commands: {
                huawei: [
                    '# Configure PC1',
                    'ip address 192.168.10.10 255.255.255.0 192.168.10.1',
                    '# Configure PC2',
                    'ip address 192.168.20.10 255.255.255.0 192.168.20.1'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'PCs must have correct IPs',
                    check: (context: LabValidationContext) => {
                        const pc1 = context.devices.find(d => d.model === 'PC' && d.ports[0]?.config.ipAddress === '192.168.10.10');
                        const pc2 = context.devices.find(d => d.model === 'PC' && d.ports[0]?.config.ipAddress === '192.168.20.10');
                        return !!pc1 && !!pc2;
                    },
                    errorMessage: 'PCs do not have the correct IPs configured'
                }
            ],
            points: 15
        }
    ],
    rewards: {
        stars: 3,
        experience: 100,
        badges: ['vlan-basics', 'network-segmentation']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.1.0',
        created: '2024-01-01',
        updated: '2026-01-05'
    }
};
