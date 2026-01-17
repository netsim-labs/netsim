import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab31: Lab = {
    id: 'yunshan-basics',
    title: 'YunShan OS: Configuration Life Cycle',
    description: 'Learn to manage atomic configurations on CloudEngine devices using Commit and Abort.',
    difficulty: 'intermediate',
    certification: 'hcip',
    estimatedTime: 20,
    prerequisites: ['VLANs', 'Basic Huawei VRP'],
    objectives: [
        'Understand the difference between Candidate and Running configuration',
        'Use the commit command to apply changes',
        'Use the abort command to discard changes'
    ],
    topology: {
        devices: [
            { type: 'Switch', count: 1, config: { model: 'Huawei-CE6800', hostname: 'DC-Leaf-1' } },
            { type: 'PC', count: 1 }
        ],
        connections: [
            { from: 'DC-Leaf-1:XGE0/0/1', to: 'PC1:eth0', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'staged-config',
            title: 'Staged Configuration',
            description: 'Define the hostname without applying it yet.',
            instructions: [
                'Enter system-view',
                'Change sysname to CE6800-PROD',
                'Verify that the prompt has NOT changed yet',
                'Use "display candidate-configuration" to see the pending change'
            ],
            commands: {
                huawei: [
                    'system-view',
                    'sysname CE6800-PROD',
                    'display candidate-configuration'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'A candidate configuration with the new name must exist',
                    check: (context: LabValidationContext) => {
                        const ce = context.devices.find(d => d.model === 'Huawei-CE6800');
                        return !!ce?.candidateState && ce.candidateState.hostname === 'CE6800-PROD';
                    },
                    errorMessage: 'You have not configured sysname in candidate configuration.'
                }
            ],
            points: 30
        },
        {
            id: 'commit-config',
            title: 'Consolidate Changes (Commit)',
            description: 'Apply changes definitively.',
            instructions: [
                'Execute command "commit"',
                'Verify that the prompt now shows CE6800-PROD',
                'Use "display current-configuration" to confirm'
            ],
            commands: {
                huawei: ['commit']
            },
            validation: [
                {
                    type: 'config',
                    description: 'Actual hostname must now be CE6800-PROD',
                    check: (context: LabValidationContext) => {
                        const ce = context.devices.find(d => d.model === 'Huawei-CE6800');
                        return ce?.hostname === 'CE6800-PROD' && !ce.candidateState;
                    },
                    errorMessage: 'You must execute the commit command to apply the changes.'
                }
            ],
            points: 40
        }
    ],
    rewards: {
        stars: 3,
        experience: 250,
        badges: ['yunshan-expert', 'data-center-basic']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-05',
        updated: '2026-01-05'
    }
};
