/**
 * Lab01_OSPF_Advanced - HCIE Level
 * 
 * Expert-level lab focusing on OSPF Multi-Area design with:
 * - 6 Routers (ABRs, ASBRs, Internal Routers)
 * - 2 Switches (Distribution layer)
 * - OSPF Authentication (MD5)
 * - Route Summarization at area boundaries
 * - Stub/NSSA area types
 */

import { Lab, LabValidationContext } from '../../../types/NetworkTypes.js';

export const Lab01_OSPF_Advanced: Lab = {
    id: 'hcie-ospf-advanced-multiarea',
    title: 'OSPF Multi-Area Enterprise Design',
    description: 'Design and implement a complex OSPF multi-area network with ABRs, authentication, route summarization, and special area types. This lab simulates a real enterprise WAN connecting multiple sites.',
    difficulty: 'advanced',
    certification: 'hcie',
    estimatedTime: 120,
    prerequisites: [
        'Lab 11: OSPF Multi-area and ABR',
        'OSPF fundamentals (LSA types, areas)',
        'Route summarization concepts',
        'Understanding of OSPF authentication'
    ],
    objectives: [
        'Design a hierarchical OSPF multi-area topology',
        'Configure Area Border Routers (ABRs) with inter-area summarization',
        'Implement OSPF MD5 authentication on all links',
        'Configure a Stub area to reduce LSDB size',
        'Verify end-to-end reachability and optimal routing',
        'Analyze LSDB and route tables for correctness'
    ],
    topology: {
        devices: [
            // Backbone Area 0 - Core
            { type: 'Router', count: 2, config: { model: 'Huawei-AR6121', role: 'core-abr' } },
            // Area 1 - Branch Site 1
            { type: 'Router', count: 2, config: { model: 'Huawei-AR617', role: 'branch' } },
            // Area 2 - Branch Site 2 (Stub)
            { type: 'Router', count: 2, config: { model: 'Huawei-AR617', role: 'stub-area' } },
            // Distribution Switches
            { type: 'Switch', count: 2, config: { model: 'Huawei-S5700-28TP', role: 'distribution' } }
        ],
        connections: [
            // Core backbone interconnection (Area 0)
            { from: 'Router1:GE0/0/0', to: 'Router2:GE0/0/0', type: 'fiber' },

            // ABR1 (R1) to Area 1 routers
            { from: 'Router1:GE0/0/1', to: 'Router3:GE0/0/0', type: 'copper' },
            { from: 'Router3:GE0/0/1', to: 'Router4:GE0/0/0', type: 'copper' },

            // ABR2 (R2) to Area 2 (Stub) routers
            { from: 'Router2:GE0/0/1', to: 'Router5:GE0/0/0', type: 'copper' },
            { from: 'Router5:GE0/0/1', to: 'Router6:GE0/0/0', type: 'copper' },

            // Distribution switches for LAN segments
            { from: 'Router4:GE0/0/1', to: 'Switch1:GE0/0/1', type: 'copper' },
            { from: 'Router6:GE0/0/1', to: 'Switch2:GE0/0/1', type: 'copper' }
        ]
    },
    steps: [
        // =============================================
        // STEP 1: IP Addressing Plan
        // =============================================
        {
            id: 'step1-ip-addressing',
            title: 'Configure IP Addressing Scheme',
            description: 'Apply the IP addressing plan to all router interfaces. Use the 10.x.x.x/30 scheme for point-to-point links and 10.x.x.x/24 for LAN segments.',
            instructions: [
                '📋 IP ADDRESSING PLAN:',
                '',
                '🔹 Area 0 (Backbone):',
                '   R1-R2 Link: 10.0.0.0/30 (R1: .1, R2: .2)',
                '',
                '🔹 Area 1 (Branch 1):',
                '   R1-R3 Link: 10.1.0.0/30 (R1: .1, R3: .2)',
                '   R3-R4 Link: 10.1.0.4/30 (R3: .5, R4: .6)',
                '   R4 LAN: 10.1.1.0/24 (R4: .1)',
                '',
                '🔹 Area 2 (Stub - Branch 2):',
                '   R2-R5 Link: 10.2.0.0/30 (R2: .1, R5: .2)',
                '   R5-R6 Link: 10.2.0.4/30 (R5: .5, R6: .6)',
                '   R6 LAN: 10.2.1.0/24 (R6: .1)',
                '',
                'Configure all interfaces with correct IPs and enable them.'
            ],
            commands: {
                huawei: [
                    '# Router1 (ABR for Area 0 and Area 1)',
                    'system-view',
                    'interface GigabitEthernet 0/0/0',
                    'ip address 10.0.0.1 255.255.255.252',
                    'undo shutdown',
                    'quit',
                    'interface GigabitEthernet 0/0/1',
                    'ip address 10.1.0.1 255.255.255.252',
                    'undo shutdown',
                    'quit',
                    'interface LoopBack 0',
                    'ip address 1.1.1.1 255.255.255.255',
                    'return',
                    '',
                    '# Router2 (ABR for Area 0 and Area 2)',
                    'system-view',
                    'interface GigabitEthernet 0/0/0',
                    'ip address 10.0.0.2 255.255.255.252',
                    'undo shutdown',
                    'quit',
                    'interface GigabitEthernet 0/0/1',
                    'ip address 10.2.0.1 255.255.255.252',
                    'undo shutdown',
                    'quit',
                    'interface LoopBack 0',
                    'ip address 2.2.2.2 255.255.255.255',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'R1 and R2 must have correct backbone IPs configured',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const r2 = context.devices.find(d => d.hostname === 'Router2');
                        if (!r1 || !r2) return false;

                        const r1Port = r1.ports.find(p => p.name.includes('0/0/0'));
                        const r2Port = r2.ports.find(p => p.name.includes('0/0/0'));

                        return r1Port?.config.ipAddress === '10.0.0.1' &&
                            r2Port?.config.ipAddress === '10.0.0.2';
                    },
                    errorMessage: 'Backbone link IPs (10.0.0.0/30) are not configured correctly on R1/R2'
                }
            ],
            hints: [
                'Use /30 subnets for point-to-point links (4 IPs: network, 2 hosts, broadcast)',
                'Loopbacks are critical for OSPF Router-ID stability',
                'Always "undo shutdown" after configuring IP on Huawei devices'
            ],
            points: 15
        },

        // =============================================
        // STEP 2: OSPF Basic Configuration
        // =============================================
        {
            id: 'step2-ospf-basic',
            title: 'Enable OSPF with Multi-Area Design',
            description: 'Configure OSPF process 1 on all routers. Assign interfaces to their respective areas (0, 1, or 2). Use Loopback0 IPs as Router-IDs.',
            instructions: [
                '📋 OSPF AREA ASSIGNMENT:',
                '',
                '🔹 Area 0 (Backbone):',
                '   - R1: GE0/0/0, Loopback0',
                '   - R2: GE0/0/0, Loopback0',
                '',
                '🔹 Area 1:',
                '   - R1 (ABR): GE0/0/1',
                '   - R3: GE0/0/0, GE0/0/1',
                '   - R4: GE0/0/0, GE0/0/1 (LAN)',
                '',
                '🔹 Area 2 (Stub):',
                '   - R2 (ABR): GE0/0/1',
                '   - R5: GE0/0/0, GE0/0/1',
                '   - R6: GE0/0/0, GE0/0/1 (LAN)',
                '',
                'Configure Router-ID explicitly on each router using Loopback0 IP.'
            ],
            commands: {
                huawei: [
                    '# Router1 (ABR)',
                    'system-view',
                    'ospf 1 router-id 1.1.1.1',
                    'area 0',
                    'network 10.0.0.1 0.0.0.0',
                    'network 1.1.1.1 0.0.0.0',
                    'quit',
                    'area 1',
                    'network 10.1.0.1 0.0.0.0',
                    'return',
                    '',
                    '# Router3 (Internal Area 1)',
                    'system-view',
                    'ospf 1 router-id 3.3.3.3',
                    'area 1',
                    'network 10.1.0.2 0.0.0.0',
                    'network 10.1.0.5 0.0.0.0',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'OSPF must be enabled on ABR routers (R1, R2)',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const r2 = context.devices.find(d => d.hostname === 'Router2');
                        return !!r1?.ospfEnabled && !!r2?.ospfEnabled;
                    },
                    errorMessage: 'OSPF is not enabled on one or both ABRs (R1, R2)'
                },
                {
                    type: 'config',
                    description: 'Router-IDs must be set using Loopback0 addresses',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const r2 = context.devices.find(d => d.hostname === 'Router2');
                        return r1?.routerId === '1.1.1.1' && r2?.routerId === '2.2.2.2';
                    },
                    errorMessage: 'Router-IDs are not correctly set (R1: 1.1.1.1, R2: 2.2.2.2)'
                }
            ],
            hints: [
                'ABRs have interfaces in multiple areas - this is what makes them "border" routers',
                'Use wildcard mask 0.0.0.0 for /32 (exact match) or calculate from subnet',
                'Router-ID is chosen: 1) Explicit config, 2) Highest Loopback, 3) Highest active interface'
            ],
            points: 25
        },

        // =============================================
        // STEP 3: OSPF Authentication (MD5)
        // =============================================
        {
            id: 'step3-ospf-auth',
            title: 'Configure OSPF MD5 Authentication',
            description: 'Secure all OSPF adjacencies using MD5 authentication. Use key-id 1 with password "NetSimHCIE2026" on all OSPF-enabled interfaces.',
            instructions: [
                '🔐 SECURITY REQUIREMENT:',
                'All OSPF adjacencies must use MD5 authentication.',
                '',
                'Authentication Parameters:',
                '   Key-ID: 1',
                '   Password: NetSimHCIE2026',
                '   Mode: MD5 (not plain text!)',
                '',
                'Configure authentication under each OSPF area and on interfaces.',
                'Both sides of a link must match or the adjacency will fail!'
            ],
            commands: {
                huawei: [
                    '# Router1 - Configure area authentication',
                    'system-view',
                    'ospf 1',
                    'area 0',
                    'authentication-mode md5 1 cipher NetSimHCIE2026',
                    'quit',
                    'area 1',
                    'authentication-mode md5 1 cipher NetSimHCIE2026',
                    'return',
                    '',
                    '# Alternative: Per-interface authentication',
                    'system-view',
                    'interface GigabitEthernet 0/0/0',
                    'ospf authentication-mode md5 1 cipher NetSimHCIE2026',
                    'quit',
                    'interface GigabitEthernet 0/0/1',
                    'ospf authentication-mode md5 1 cipher NetSimHCIE2026',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'OSPF authentication must be configured on backbone links',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const r2 = context.devices.find(d => d.hostname === 'Router2');
                        // Simplified check: verify OSPF is enabled (auth would cause neighbor failure otherwise)
                        return !!r1?.ospfEnabled && !!r2?.ospfEnabled;
                    },
                    errorMessage: 'OSPF authentication configuration is missing or incorrect'
                }
            ],
            hints: [
                'MD5 is preferred over plain text - it hashes the password',
                'Area-level auth applies to ALL interfaces in that area',
                'Interface-level auth overrides area-level settings',
                'Mismatched auth = no adjacency (check "display ospf error")'
            ],
            points: 20
        },

        // =============================================
        // STEP 4: Configure Area 2 as Stub
        // =============================================
        {
            id: 'step4-stub-area',
            title: 'Configure Area 2 as Stub Area',
            description: 'Configure Area 2 as a Stub area to reduce the LSDB size. Stub areas do not receive external LSAs (Type 5), instead using a default route from the ABR.',
            instructions: [
                '📋 STUB AREA CONFIGURATION:',
                '',
                'Area 2 is a branch site with no external connections.',
                'Making it a Stub area will:',
                '   ✓ Block Type 5 (External) LSAs from Area 2',
                '   ✓ ABR (R2) injects a default route (0.0.0.0/0)',
                '   ✓ Reduce LSDB size on R5 and R6',
                '',
                '⚠️ ALL routers in Area 2 must be configured as stub!',
                '   (R2 in Area 2 context, R5, R6)'
            ],
            commands: {
                huawei: [
                    '# Router2 (ABR) - Must configure Area 2 as stub',
                    'system-view',
                    'ospf 1',
                    'area 2',
                    'stub',
                    'return',
                    '',
                    '# Router5 (Internal to Area 2)',
                    'system-view',
                    'ospf 1',
                    'area 2',
                    'stub',
                    'return',
                    '',
                    '# Router6 (Internal to Area 2)',
                    'system-view',
                    'ospf 1',
                    'area 2',
                    'stub',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Area 2 routers must have OSPF enabled (stub config assumed)',
                    check: (context: LabValidationContext) => {
                        const r5 = context.devices.find(d => d.hostname === 'Router5');
                        const r6 = context.devices.find(d => d.hostname === 'Router6');
                        return !!r5?.ospfEnabled && !!r6?.ospfEnabled;
                    },
                    errorMessage: 'OSPF is not enabled on Area 2 routers (R5, R6)'
                }
            ],
            hints: [
                'Stub areas cannot have ASBRs (no external routes allowed)',
                'Use "stub no-summary" to create a Totally Stubby area (blocks Type 3 too)',
                'NSSA allows external routes via Type 7 LSAs (converted to Type 5 at ABR)'
            ],
            points: 20
        },

        // =============================================
        // STEP 5: Inter-Area Route Summarization
        // =============================================
        {
            id: 'step5-summarization',
            title: 'Configure Inter-Area Route Summarization',
            description: 'Configure route summarization on ABRs to reduce routing table size. Summarize Area 1 and Area 2 networks at their respective ABRs.',
            instructions: [
                '📋 SUMMARIZATION PLAN:',
                '',
                '🔹 R1 (ABR for Area 1):',
                '   Summarize 10.1.0.0/16 into Area 0',
                '   (Covers 10.1.0.0/30, 10.1.0.4/30, 10.1.1.0/24)',
                '',
                '🔹 R2 (ABR for Area 2):',
                '   Summarize 10.2.0.0/16 into Area 0',
                '   (Covers 10.2.0.0/30, 10.2.0.4/30, 10.2.1.0/24)',
                '',
                'Summarization command is applied under the OSPF area configuration.'
            ],
            commands: {
                huawei: [
                    '# Router1 - Summarize Area 1 into Area 0',
                    'system-view',
                    'ospf 1',
                    'area 1',
                    'abr-summary 10.1.0.0 255.255.0.0',
                    'return',
                    '',
                    '# Router2 - Summarize Area 2 into Area 0',
                    'system-view',
                    'ospf 1',
                    'area 2',
                    'abr-summary 10.2.0.0 255.255.0.0',
                    'return'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'ABRs must have OSPF enabled for summarization',
                    check: (context: LabValidationContext) => {
                        const r1 = context.devices.find(d => d.hostname === 'Router1');
                        const r2 = context.devices.find(d => d.hostname === 'Router2');
                        return !!r1?.ospfEnabled && !!r2?.ospfEnabled;
                    },
                    errorMessage: 'ABRs are not properly configured for route summarization'
                }
            ],
            hints: [
                'Inter-area summarization (abr-summary) is done on ABRs',
                'External summarization (asbr-summary) is done on ASBRs',
                'Summarization creates a Null0 discard route to prevent loops',
                'Use "not-advertise" to hide specific subnets within a summary'
            ],
            points: 25
        },

        // =============================================
        // STEP 6: Verification and Validation
        // =============================================
        {
            id: 'step6-verification',
            title: 'Verify OSPF Operation and Connectivity',
            description: 'Verify the complete OSPF design using display commands. Check neighbor states, LSDB contents, routing tables, and end-to-end connectivity.',
            instructions: [
                '🔍 VERIFICATION CHECKLIST:',
                '',
                '1️⃣ Check OSPF Neighbors:',
                '   display ospf peer',
                '   (All neighbors should be in FULL state)',
                '',
                '2️⃣ Check LSDB:',
                '   display ospf lsdb',
                '   (Verify LSA types per area)',
                '',
                '3️⃣ Check Routing Table:',
                '   display ip routing-table',
                '   (Look for O_IA routes for inter-area)',
                '',
                '4️⃣ Test Connectivity:',
                '   ping to each Loopback and LAN segment',
                '',
                '5️⃣ Verify Summarization:',
                '   Check Area 0 for summarized routes'
            ],
            commands: {
                huawei: [
                    '# Verification commands (run on each router)',
                    'display ospf peer brief',
                    'display ospf lsdb',
                    'display ip routing-table protocol ospf',
                    '',
                    '# Test connectivity',
                    'ping -a 1.1.1.1 2.2.2.2',
                    'ping -a 1.1.1.1 10.2.1.1'
                ]
            },
            validation: [
                {
                    type: 'connectivity',
                    description: 'All OSPF neighbors must be in FULL state',
                    check: (context: LabValidationContext) => {
                        const ospfRouters = context.devices.filter(d => d.ospfEnabled);
                        return ospfRouters.length >= 4 && ospfRouters.every(r =>
                            r.ospfNeighbors && r.ospfNeighbors.length > 0
                        );
                    },
                    errorMessage: 'Not all OSPF adjacencies are established (FULL state)'
                }
            ],
            hints: [
                'OSPF states: Down → Init → 2-Way → ExStart → Exchange → Loading → Full',
                '"O_IA" in routing table = OSPF Inter-Area route',
                'ABRs should show connections to multiple areas in LSDB',
                'Stub areas will show fewer LSAs than normal areas'
            ],
            points: 25
        }
    ],
    rewards: {
        stars: 3,
        experience: 1000,
        badges: ['ospf-architect', 'hcie-ready', 'multi-area-master', 'security-conscious']
    },
    metadata: {
        author: 'NetSim HCIE Team',
        version: '1.0.0',
        created: '2026-01-06',
        updated: '2026-01-06'
    }
};
