import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab13: Lab = {
    id: 'vrrp-gateway',
    title: 'Gateway Redundancy (VRRP)',
    description: 'Configure Virtual Router Redundancy Protocol (VRRP) to provide a high availability gateway for LAN hosts',
    difficulty: 'intermediate',
    certification: 'hcia',
    estimatedTime: 45,
    prerequisites: ['Lab 1: Basic Campus LAN', 'Gateway Redundancy Concepts'],
    objectives: [
        'Configure L3 VLAN interfaces',
        'Create a VRRP group',
        'Assign a virtual IP address',
        'Adjust priorities to define Master and Backup'
    ],
    topology: {
        devices: [
            { type: 'Switch', count: 2, config: { model: 'Huawei-S5700-28TP' } },
            { type: 'PC', count: 1 }
        ],
        connections: [
            { from: 'Switch1:GE0/0/24', to: 'Switch2:GE0/0/24', type: 'copper' },
            { from: 'Switch1:GE0/0/1', to: 'PC1:eth0', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'vrrp-master',
            title: 'Configure VRRP Master (SW1)',
            description: 'Configure SW1 as Master for VLAN 1 with Virtual IP 192.168.1.254',
            instructions: [
                'On SW1, interface Vlanif 1',
                'ip address 192.168.1.1 24',
                'vrrp vrid 1 virtual-ip 192.168.1.254',
                'vrrp vrid 1 priority 120 (To be the Master)'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'interface Vlanif 1',
                    'ip address 192.168.1.1 255.255.255.0',
                    'vrrp vrid 1 virtual-ip 192.168.1.254',
                    'vrrp vrid 1 priority 120',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'SW1 must have VRRP configured with priority 120',
                    check: (context: LabValidationContext) => {
                        const sw1 = context.devices.find(d => d.hostname === 'Switch1');
                        const vlanif = sw1?.vlanifs?.find(v => v.vlanId === 1);
                        const vrrp = vlanif?.vrrp?.find(g => g.id === '1');
                        return vrrp?.virtualIp === '192.168.1.254' && vrrp.priority === 120;
                    },
                    errorMessage: 'The VRRP configuration on SW1 does not meet the requirements'
                }
            ],
            points: 25
        },
        {
            id: 'vrrp-backup',
            title: 'Configure VRRP Backup (SW2)',
            description: 'Configure SW2 as Backup for the same VRRP group',
            instructions: [
                'On SW2, interface Vlanif 1',
                'ip address 192.168.1.2 24',
                'vrrp vrid 1 virtual-ip 192.168.1.254',
                '(Default priority 100 will make it Backup)'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'interface Vlanif 1',
                    'ip address 192.168.1.2 255.255.255.0',
                    'vrrp vrid 1 virtual-ip 192.168.1.254',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'SW2 must be Backup with the same Virtual IP',
                    check: (context: LabValidationContext) => {
                        const sw2 = context.devices.find(d => d.hostname === 'Switch2');
                        const vlanif = sw2?.vlanifs?.find(v => v.vlanId === 1);
                        const vrrp = vlanif?.vrrp?.find(g => g.id === '1');
                        return vrrp?.virtualIp === '192.168.1.254';
                    },
                    errorMessage: 'SW2 does not have the VRRP group configured consistently'
                }
            ],
            points: 25
        }
    ],
    rewards: {
        stars: 3,
        experience: 300,
        badges: ['ha-master', 'vrrp-operator']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
