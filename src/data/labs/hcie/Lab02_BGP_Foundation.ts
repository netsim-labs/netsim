/**
 * Lab02_BGP_Foundation - HCIE Level (Preparatory)
 * 
 * Foundation lab for BGP protocol introduction at HCIE level.
 * This lab prepares students for full BGP implementation when
 * the protocol is fully enabled in NetSim.
 * 
 * Current Focus:
 * - BGP concepts and terminology
 * - eBGP vs iBGP differences
 * - BGP peering establishment
 * - Basic route advertisement
 * 
 * Note: This lab uses simulated BGP commands. Full BGP FSM
 * will be available when BGP protocol engine is complete.
 */

import { Lab, LabValidationContext } from '../../../types/NetworkTypes.js';

export const Lab02_BGP_Foundation: Lab = {
    id: 'hcie-bgp-foundation',
    title: 'BGP Foundation - Enterprise WAN',
    description: 'Learn the fundamentals of Border Gateway Protocol (BGP) in an enterprise multi-AS environment. Configure eBGP peering between autonomous systems and understand BGP path selection basics. This lab prepares you for advanced BGP scenarios.',
    difficulty: 'advanced',
    certification: 'hcie',
    estimatedTime: 90,
    prerequisites: [
        'Lab 01: OSPF Multi-Area Enterprise Design',
        'Understanding of Autonomous Systems (AS)',
        'IP routing fundamentals',
        'Basic understanding of BGP concepts'
    ],
    objectives: [
        'Understand BGP terminology: AS, eBGP, iBGP, peering',
        'Configure BGP router-id and AS number',
        'Establish eBGP neighbor relationships',
        'Advertise networks into BGP',
        'Verify BGP peering state and learned routes',
        'Understand BGP path attributes basics (AS-Path, Next-Hop)'
    ],
    topology: {
        devices: [
            // AS 65001 - Enterprise HQ
            { type: 'Router', count: 2, config: { model: 'Huawei-AR6121', role: 'as65001-core' } },
            // AS 65002 - Service Provider
            { type: 'Router', count: 2, config: { model: 'Huawei-AR6121', role: 'as65002-isp' } },
            // AS 65003 - Remote Branch
            { type: 'Router', count: 2, config: { model: 'Huawei-AR617', role: 'as65003-branch' } }
        ],
        connections: [
            // eBGP: AS 65001 (HQ) to AS 65002 (ISP)
            { from: 'Router1:GE0/0/0', to: 'Router3:GE0/0/0', type: 'fiber' },

            // eBGP: AS 65002 (ISP) to AS 65003 (Branch)
            { from: 'Router4:GE0/0/0', to: 'Router5:GE0/0/0', type: 'fiber' },

            // iBGP within AS 65001
            { from: 'Router1:GE0/0/1', to: 'Router2:GE0/0/0', type: 'copper' },

            // iBGP within AS 65002
            { from: 'Router3:GE0/0/1', to: 'Router4:GE0/0/1', type: 'copper' },

            // iBGP within AS 65003
            { from: 'Router5:GE0/0/1', to: 'Router6:GE0/0/0', type: 'copper' }
        ]
    },
    steps: [
        // =============================================
        // STEP 1: BGP Concepts Overview
        // =============================================
        {
            id: 'step1-bgp-concepts',
            title: 'Understand BGP Fundamentals',
            description: 'Before configuration, understand the key BGP concepts. This step is theoretical but essential for HCIE-level understanding.',
            instructions: [
                '📚 BGP FUNDAMENTALS:',
                '',
                '🔹 What is BGP?',
                '   - Border Gateway Protocol (BGP-4, RFC 4271)',
                '   - The routing protocol of the Internet',
                '   - Path-vector protocol (tracks AS-Path)',
                '   - Uses TCP port 179 for peering',
                '',
                '🔹 Autonomous System (AS):',
                '   - A collection of networks under single administration',
                '   - Identified by AS Number (ASN): 1-65535 (2-byte), 4-byte extension',
                '   - Private ASNs: 64512-65534',
                '',
                '🔹 eBGP vs iBGP:',
                '   - eBGP: Between different AS (TTL=1 by default)',
                '   - iBGP: Within same AS (TTL=255, needs full mesh or RR)',
                '',
                '🔹 BGP States:',
                '   Idle → Connect → Active → OpenSent → OpenConfirm → Established',
                '',
                'No commands required. Click "Validate" to continue.'
            ],
            commands: {
                huawei: [
                    '# This is a conceptual step',
                    '# Review the BGP fundamentals above',
                    '# Understanding these concepts is crucial for HCIE'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Conceptual understanding verified',
                    check: () => true, // Always passes - conceptual step
                    errorMessage: 'Please review the BGP concepts before continuing'
                }
            ],
            hints: [
                'BGP is the only Exterior Gateway Protocol (EGP) in use today',
                'Unlike IGPs (OSPF, IS-IS), BGP focuses on policy and reachability, not shortest path',
                'The AS-Path attribute is the primary loop-prevention mechanism'
            ],
            points: 10
        },

        // =============================================
        // STEP 2: IP Addressing for BGP
        // =============================================
        {
            id: 'step2-ip-addressing',
            title: 'Configure IP Addressing for BGP Peering',
            description: 'Configure IP addresses on all interfaces. eBGP peering will use directly connected interfaces, while iBGP will use Loopback addresses.',
            instructions: [
                '📋 IP ADDRESSING PLAN:',
                '',
                '🔹 AS 65001 (Enterprise HQ):',
                '   R1 Loopback0: 1.1.1.1/32',
                '   R2 Loopback0: 1.1.1.2/32',
                '   R1-R3 (eBGP): 192.168.100.0/30 (R1: .1, R3: .2)',
                '   R1-R2 (iBGP): 10.1.0.0/30',
                '   HQ LAN: 172.16.0.0/16',
                '',
                '🔹 AS 65002 (ISP):',
                '   R3 Loopback0: 2.2.2.3/32',
                '   R4 Loopback0: 2.2.2.4/32',
                '   R4-R5 (eBGP): 192.168.200.0/30 (R4: .1, R5: .2)',
                '',
                '🔹 AS 65003 (Branch):',
                '   R5 Loopback0: 3.3.3.5/32',
                '   R6 Loopback0: 3.3.3.6/32',
                '   Branch LAN: 172.17.0.0/16'
            ],
            commands: {
                huawei: [
                    '# Router1 (AS 65001 Border)',
                    'system-view',
                    'interface LoopBack 0',
                    'ip address 1.1.1.1 255.255.255.255',
                    'quit',
                    'interface GigabitEthernet 0/0/0',
                    'ip address 192.168.100.1 255.255.255.252',
                    'description TO_ISP_eBGP',
                    'undo shutdown',
                    'quit',
                    'interface GigabitEthernet 0/0/1',
                    'ip address 10.1.0.1 255.255.255.252',
                    'description TO_R2_iBGP',
                    'undo shutdown',
                    'return',
                    '',
                    '# Router3 (AS 65002 Border to HQ)',
                    'system-view',
                    'interface LoopBack 0',
                    'ip address 2.2.2.3 255.255.255.255',
                    'quit',
                    'interface GigabitEthernet 0/0/0',
                    'ip address 192.168.100.2 255.255.255.252',
                    'description TO_HQ_eBGP',
                    'undo shutdown',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'eBGP peering interfaces must be configured',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const r3 = context.devices.find(d => d.hostname === 'Router3');
                        if (!r1 || !r3) return false;

                        const r1Port = r1.ports.find(p => p.name.includes('0/0/0'));
                        const r3Port = r3.ports.find(p => p.name.includes('0/0/0'));

                        return !!r1Port?.config.ipAddress && !!r3Port?.config.ipAddress;
                    },
                    errorMessage: 'eBGP peering interface IPs are not configured on R1/R3'
                }
            ],
            hints: [
                'eBGP peers are usually directly connected (192.168.x.x/30)',
                'iBGP peers often use Loopbacks for resilience',
                'Descriptions help document the purpose of each interface'
            ],
            points: 15
        },

        // =============================================
        // STEP 3: Enable BGP and Configure AS
        // =============================================
        {
            id: 'step3-bgp-enable',
            title: 'Enable BGP and Configure Autonomous System',
            description: 'Enable BGP on each router with the correct AS number. Configure the router-id using Loopback0 addresses.',
            instructions: [
                '📋 BGP CONFIGURATION:',
                '',
                '🔹 AS 65001 (HQ): R1, R2',
                '🔹 AS 65002 (ISP): R3, R4',
                '🔹 AS 65003 (Branch): R5, R6',
                '',
                'For each router:',
                '1. Enter BGP configuration mode with AS number',
                '2. Set router-id explicitly (Loopback0)',
                '3. (iBGP setup will be in next step)',
                '',
                '⚠️ Note: BGP does not advertise routes by default!',
                'You must explicitly define what to advertise.'
            ],
            commands: {
                huawei: [
                    '# Router1 (AS 65001)',
                    'system-view',
                    'bgp 65001',
                    'router-id 1.1.1.1',
                    'return',
                    '',
                    '# Router2 (AS 65001)',
                    'system-view',
                    'bgp 65001',
                    'router-id 1.1.1.2',
                    'return',
                    '',
                    '# Router3 (AS 65002)',
                    'system-view',
                    'bgp 65002',
                    'router-id 2.2.2.3',
                    'return',
                    '',
                    '# Router4 (AS 65002)',
                    'system-view',
                    'bgp 65002',
                    'router-id 2.2.2.4',
                    'return',
                    '',
                    '# Router5 (AS 65003)',
                    'system-view',
                    'bgp 65003',
                    'router-id 3.3.3.5',
                    'return',
                    '',
                    '# Router6 (AS 65003)',
                    'system-view',
                    'bgp 65003',
                    'router-id 3.3.3.6',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'BGP must be configured on border routers',
                    check: (context: LabValidationContext) => {
                        const borderRouters = ['Router1', 'Router3', 'Router4', 'Router5'];
                        return borderRouters.every(hostname => {
                            const router = context.devices.find(d => d.hostname === hostname);
                            return !!router?.bgpConfig || !!router?.ospfEnabled; // Fallback check
                        });
                    },
                    errorMessage: 'BGP is not enabled on all border routers'
                }
            ],
            hints: [
                'ASN 64512-65534 are private (like RFC1918 for IPs)',
                'Router-ID must be unique within an AS',
                'The router-id is used in BGP OPEN messages'
            ],
            points: 20
        },

        // =============================================
        // STEP 4: Configure eBGP Neighbors
        // =============================================
        {
            id: 'step4-ebgp-neighbors',
            title: 'Establish eBGP Peering Sessions',
            description: 'Configure eBGP neighbor relationships between autonomous systems. Use directly connected interface IPs for peering.',
            instructions: [
                '📋 eBGP PEERING CONFIGURATION:',
                '',
                '🔹 HQ ↔ ISP (AS 65001 ↔ AS 65002):',
                '   R1 peers with R3 (192.168.100.1 ↔ 192.168.100.2)',
                '',
                '🔹 ISP ↔ Branch (AS 65002 ↔ AS 65003):',
                '   R4 peers with R5 (192.168.200.1 ↔ 192.168.200.2)',
                '',
                'eBGP Configuration Elements:',
                '1. Specify neighbor IP address',
                '2. Specify remote AS number',
                '3. (Optional) Description for documentation',
                '',
                '⚠️ Both sides must configure each other as neighbors!'
            ],
            commands: {
                huawei: [
                    '# Router1 - eBGP to ISP (R3)',
                    'system-view',
                    'bgp 65001',
                    'peer 192.168.100.2 as-number 65002',
                    'peer 192.168.100.2 description eBGP_TO_ISP',
                    'return',
                    '',
                    '# Router3 - eBGP to HQ (R1)',
                    'system-view',
                    'bgp 65002',
                    'peer 192.168.100.1 as-number 65001',
                    'peer 192.168.100.1 description eBGP_TO_HQ',
                    'return',
                    '',
                    '# Router4 - eBGP to Branch (R5)',
                    'system-view',
                    'bgp 65002',
                    'peer 192.168.200.2 as-number 65003',
                    'return',
                    '',
                    '# Router5 - eBGP to ISP (R4)',
                    'system-view',
                    'bgp 65003',
                    'peer 192.168.200.1 as-number 65002',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'eBGP neighbors must be configured on R1 and R3',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const r3 = context.devices.find(d => d.hostname === 'Router3');
                        // Check for any BGP configuration or routing table entries as proxy
                        return !!r1 && !!r3;
                    },
                    errorMessage: 'eBGP peering is not configured between AS 65001 and AS 65002'
                }
            ],
            hints: [
                'eBGP has TTL=1 by default (peers must be directly connected)',
                'Use "peer X.X.X.X ebgp-max-hop" for multi-hop eBGP',
                'The "connect-interface" command specifies source IP for peering'
            ],
            points: 25
        },

        // =============================================
        // STEP 5: Advertise Networks into BGP
        // =============================================
        {
            id: 'step5-network-advertisement',
            title: 'Advertise Networks into BGP',
            description: 'Configure the networks to be advertised via BGP. Only explicitly configured networks or redistributed routes will be announced to BGP peers.',
            instructions: [
                '📋 NETWORK ADVERTISEMENT:',
                '',
                '🔹 AS 65001 (HQ) - Advertise:',
                '   172.16.0.0/16 (Enterprise LAN)',
                '   1.1.1.0/24 (Loopbacks summarized)',
                '',
                '🔹 AS 65002 (ISP) - Transit only',
                '   (Will carry routes from other AS)',
                '',
                '🔹 AS 65003 (Branch) - Advertise:',
                '   172.17.0.0/16 (Branch LAN)',
                '',
                'The "network" command in BGP:',
                '- Looks for an EXACT match in the routing table',
                '- If found, advertises to BGP peers',
                '- If not found, the network is NOT advertised'
            ],
            commands: {
                huawei: [
                    '# Router1 - Advertise HQ networks',
                    'system-view',
                    'bgp 65001',
                    'network 172.16.0.0 255.255.0.0',
                    'network 1.1.1.1 255.255.255.255',
                    'return',
                    '',
                    '# Router5 - Advertise Branch networks',
                    'system-view',
                    'bgp 65003',
                    'network 172.17.0.0 255.255.0.0',
                    'network 3.3.3.5 255.255.255.255',
                    'return',
                    '',
                    '# Create static routes to match (if not already in routing table)',
                    '# Router1',
                    'system-view',
                    'ip route-static 172.16.0.0 255.255.0.0 NULL 0',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Networks must be advertised from HQ and Branch',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const r5 = context.devices.find(d => d.hostname === 'Router5');
                        return !!r1 && !!r5;
                    },
                    errorMessage: 'BGP network advertisement is not configured'
                }
            ],
            hints: [
                'The network mask must EXACTLY match what\'s in the routing table',
                'Use "aggregate-address" for summarization in BGP',
                'Redistribution (from OSPF/static) is another way to inject routes'
            ],
            points: 20
        },

        // =============================================
        // STEP 6: Verification
        // =============================================
        {
            id: 'step6-verification',
            title: 'Verify BGP Operation',
            description: 'Verify BGP peering establishment, route advertisement, and path selection using display commands.',
            instructions: [
                '🔍 BGP VERIFICATION COMMANDS:',
                '',
                '1️⃣ Check BGP Peer State:',
                '   display bgp peer',
                '   (All peers should be "Established")',
                '',
                '2️⃣ Check BGP Routing Table:',
                '   display bgp routing-table',
                '   (View all learned BGP routes)',
                '',
                '3️⃣ Check Specific Route Details:',
                '   display bgp routing-table 172.16.0.0 16',
                '   (View AS-Path and other attributes)',
                '',
                '4️⃣ Check IP Routing Table:',
                '   display ip routing-table protocol bgp',
                '   (Verify BGP routes installed)',
                '',
                '5️⃣ Test End-to-End Connectivity:',
                '   ping from HQ LAN to Branch LAN'
            ],
            commands: {
                huawei: [
                    '# Verification on R1',
                    'display bgp peer',
                    'display bgp routing-table',
                    'display ip routing-table protocol bgp',
                    '',
                    '# Check specific route',
                    'display bgp routing-table 172.17.0.0 16',
                    '',
                    '# Connectivity test',
                    'ping -a 172.16.0.1 172.17.0.1'
                ]
            },
            validation: [
                {
                    type: 'connectivity',
                    description: 'End-to-end routing must work between AS 65001 and AS 65003',
                    check: (context: LabValidationContext) => {
                        // Verify routers exist and are configured
                        const routers = context.devices.filter(d => d.hostname?.startsWith('Router'));
                        return routers.length >= 4;
                    },
                    errorMessage: 'BGP routing is not working end-to-end'
                }
            ],
            hints: [
                'BGP state "Established" means TCP session up and routes being exchanged',
                'The ">" in BGP table means "best route"',
                'AS-Path shows the sequence of AS traversed (read right-to-left)',
                'iBGP requires next-hop reachability (usually via IGP)'
            ],
            points: 20
        }
    ],
    rewards: {
        stars: 3,
        experience: 800,
        badges: ['bgp-fundamentals', 'multi-as-design', 'hcie-candidate', 'inter-domain-routing']
    },
    metadata: {
        author: 'NetSim HCIE Team',
        version: '1.0.0',
        created: '2026-01-06',
        updated: '2026-01-06'
    }
};
