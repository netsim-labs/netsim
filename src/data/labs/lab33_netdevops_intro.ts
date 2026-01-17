import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab33: Lab = {
    id: 'netdevops-intro',
    title: 'Introduction to Network Automation',
    description: 'Learn to automate network configurations using Python and the NetSim Automation Server',
    difficulty: 'intermediate',
    certification: 'hcip',
    estimatedTime: 45,
    prerequisites: ['Basic Python knowledge', 'Lab 6: OSPF Configuration'],
    objectives: [
        'Understand the Automation Server concept',
        'Use the netsim_toolkit Python library',
        'Automate interface configuration across multiple devices',
        'Query device state programmatically',
        'Configure OSPF using Python scripts'
    ],
    topology: {
        devices: [
            { type: 'Router', count: 2, config: { model: 'Huawei-AR617' } },
            { type: 'Host', count: 1, config: { model: 'Automation-Server' } }
        ],
        connections: [
            { from: 'Router1:GE0/0/0', to: 'Router2:GE0/0/0', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'discover-devices',
            title: 'Discover Network Devices',
            description: 'Use the Automation Server to list all devices in the topology',
            instructions: [
                'Click on the Automation-Server to open the Python console',
                'Run: from netsim_toolkit import get_all_devices',
                'Run: print(get_all_devices())',
                'Verify Router1 and Router2 are visible'
            ],
            commands: {
                huawei: [
                    '# Python script in Automation Server:',
                    '# from netsim_toolkit import get_all_devices',
                    '# print(get_all_devices())'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Automation Server must be present in topology',
                    check: (context: LabValidationContext) => {
                        return context.devices.some(d => d.model === 'Automation-Server');
                    },
                    errorMessage: 'Add an Automation Server to the topology'
                }
            ],
            points: 10
        },
        {
            id: 'configure-interfaces',
            title: 'Configure Interfaces via Python',
            description: 'Use Python to configure IP addresses on both routers',
            instructions: [
                'In Automation Server, create Device objects for Router1 and Router2',
                'Use configure() to set IP addresses on GE0/0/0',
                'Router1: 10.0.0.1/30, Router2: 10.0.0.2/30'
            ],
            commands: {
                huawei: [
                    '# Python script:',
                    '# r1 = Device("Router1")',
                    '# r1.configure(["system-view", "interface GE0/0/0", "ip address 10.0.0.1 30"])'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Router1 GE0/0/0 must have IP 10.0.0.1',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const port = r1?.ports.find(p => p.id.includes('GE0/0/0') || p.id.includes('GigabitEthernet0/0/0'));
                        return port?.config?.ipAddress === '10.0.0.1';
                    },
                    errorMessage: 'Router1 GE0/0/0 IP not configured correctly'
                },
                {
                    type: 'config',
                    description: 'Router2 GE0/0/0 must have IP 10.0.0.2',
                    check: (context: LabValidationContext) => {
                        const r2 = context.devices.find(d => d.hostname === 'Router2');
                        const port = r2?.ports.find(p => p.id.includes('GE0/0/0') || p.id.includes('GigabitEthernet0/0/0'));
                        return port?.config?.ipAddress === '10.0.0.2';
                    },
                    errorMessage: 'Router2 GE0/0/0 IP not configured correctly'
                }
            ],
            points: 25
        },
        {
            id: 'query-state',
            title: 'Query Device State',
            description: 'Use Python to read and display device configurations',
            instructions: [
                'Use show_interfaces() to list all interfaces',
                'Use show_config() to view running configuration',
                'Verify the IP addresses are configured'
            ],
            commands: {
                huawei: [
                    '# Python script:',
                    '# r1 = Device("Router1")',
                    '# print(r1.show_interfaces())',
                    '# print(r1.show_config())'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Both routers must have configured interfaces',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const r2 = context.devices.find(d => d.hostname === 'Router2');
                        const r1HasIp = r1?.ports.some(p => p.config?.ipAddress);
                        const r2HasIp = r2?.ports.some(p => p.config?.ipAddress);
                        return !!(r1HasIp && r2HasIp);
                    },
                    errorMessage: 'Interfaces not configured on both routers'
                }
            ],
            points: 15
        },
        {
            id: 'automate-ospf',
            title: 'Automate OSPF Configuration',
            description: 'Write a Python script to configure OSPF on both routers',
            instructions: [
                'Configure OSPF process 1 on both routers using Python loop',
                'Set Router IDs (1.1.1.1 for R1, 2.2.2.2 for R2)',
                'Advertise 10.0.0.0/30 network in Area 0'
            ],
            commands: {
                huawei: [
                    '# Python script with loop:',
                    '# for hostname, rid in [("Router1", "1.1.1.1"), ("Router2", "2.2.2.2")]:',
                    '#     Device(hostname).configure(["system-view", f"ospf 1 router-id {rid}", "area 0", "network 10.0.0.0 0.0.0.3"])'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Router1 must have OSPF enabled',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        return !!r1?.ospfEnabled;
                    },
                    errorMessage: 'OSPF not enabled on Router1'
                },
                {
                    type: 'config',
                    description: 'Router2 must have OSPF enabled',
                    check: (context: LabValidationContext) => {
                        const r2 = context.devices.find(d => d.hostname === 'Router2');
                        return !!r2?.ospfEnabled;
                    },
                    errorMessage: 'OSPF not enabled on Router2'
                }
            ],
            points: 30
        },
        {
            id: 'verify-connectivity',
            title: 'Verify Connectivity',
            description: 'Use Python to test connectivity between routers',
            instructions: [
                'Use the ping() method to test connectivity',
                'Check OSPF neighbors using show_ospf_neighbors()',
                'Verify the routing table with show_ip_route()'
            ],
            commands: {
                huawei: [
                    '# Python verification:',
                    '# r1 = Device("Router1")',
                    '# r1.ping("10.0.0.2")',
                    '# print(r1.show_ospf_neighbors())',
                    '# print(r1.show_ip_route())'
                ]
            },
            validation: [
                {
                    type: 'connectivity',
                    description: 'Routers must be able to communicate',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const r2 = context.devices.find(d => d.hostname === 'Router2');
                        return !!(r1?.ospfEnabled && r2?.ospfEnabled);
                    },
                    errorMessage: 'Network connectivity not established'
                }
            ],
            points: 20
        }
    ],
    rewards: {
        stars: 3,
        experience: 400,
        badges: ['netdevops-init', 'python-networker', 'automation-engineer']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-09',
        updated: '2026-01-09'
    }
};
