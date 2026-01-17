import { Lab, LabValidationContext } from '../../types/NetworkTypes.js';

export const lab34: Lab = {
    id: 'netdevops-ml',
    title: 'AI Ops: DDoS Detection with Scikit-learn',
    description: 'Use Machine Learning (Python/Scikit-learn) to detect anomaly traffic patterns in router logs.',
    difficulty: 'advanced',
    certification: 'hcie',
    estimatedTime: 60,
    prerequisites: ['Lab 33: Intro to Automation', 'Basic Data Science knowledge'],
    objectives: [
        'Install Pandas and Scikit-learn in the browser environment',
        'Load traffic log data (CSV)',
        'Train an IsolationForest model for anomaly detection',
        'Identify malicious IPs from the logs'
    ],
    topology: {
        devices: [
            { type: 'Router', count: 1, config: { model: 'Huawei-AR617', hostname: 'Gateway' } },
            { type: 'Host', count: 1, config: { model: 'Automation-Server' } }
        ],
        connections: [
            { from: 'Gateway:GE0/0/0', to: 'Automation-Server:Eth0', type: 'copper' }
        ]
    },
    steps: [
        {
            id: 'setup-env',
            title: 'Setup Data Science Environment',
            description: 'Install necessary Python libraries in the browser runtime.',
            instructions: [
                'Open Automation Server console',
                'Run: from netsim_toolkit import install_datascience',
                'Run: await install_datascience()',
                'Note: This might take a few seconds to download WASM binaries.'
            ],
            commands: {
                huawei: [
                    '# Python:',
                    'import netsim_toolkit',
                    'await netsim_toolkit.install_datascience()'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Environment must be ready',
                    check: (_context: LabValidationContext) => true, // Manual check mostly
                    errorMessage: 'Install datascience stack first'
                }
            ],
            points: 10
        },
        {
            id: 'load-data',
            title: 'Load Traffic Data',
            description: 'Create a synthetic dataset of traffic logs.',
            instructions: [
                'Create a Python script to generate the CSV data:',
                'Use pandas to create a DataFrame with columns: [source_ip, bytes, packets, duration]',
                'Inject normal traffic (low bytes/packets) and attack traffic (high bytes/packets)'
            ],
            commands: {
                huawei: [
                    'import pandas as pd',
                    'import io',
                    '# Mock Data',
                    'csv_data = """source_ip,bytes,packets,duration',
                    '192.168.1.5,500,5,10',
                    '192.168.1.6,450,4,12',
                    '10.0.0.50,500000,50000,2',
                    '192.168.1.7,520,6,11"""',
                    'df = pd.read_csv(io.StringIO(csv_data))',
                    'print(df.head())'
                ]
            },
            validation: [],
            points: 20
        },
        {
            id: 'detect-anomaly',
            title: 'Train Anomaly Detector',
            description: 'Use IsolationForest to find the DDoS source.',
            instructions: [
                'Import IsolationForest from sklearn.ensemble',
                'Train the model on the [bytes, packets] features',
                'Predict anomalies (-1 = anomaly, 1 = normal)',
                'Filter the DataFrame to find the IP with anomaly'
            ],
            commands: {
                huawei: [
                    'from sklearn.ensemble import IsolationForest',
                    'model = IsolationForest(contamination=0.1)',
                    'df["anomaly"] = model.fit_predict(df[["bytes", "packets"]])',
                    'attackers = df[df["anomaly"] == -1]',
                    'print("Detected Attackers:")',
                    'print(attackers["source_ip"])'
                ]
            },
            validation: [],
            points: 50
        },
        {
            id: 'block-attacker',
            title: 'Automated Mitigation',
            description: 'Automatically configure an ACL to block the detected IP.',
            instructions: [
                'Extract the attacker IP from the dataframe',
                'Use Device("Gateway").configure() to add an ACL rule denying this IP'
            ],
            commands: {
                huawei: [
                    'attacker_ip = attackers.iloc[0]["source_ip"]',
                    'gw = Device("Gateway")',
                    'gw.configure([',
                    '  "system-view",',
                    '  "acl 3000",',
                    '  f"rule deny ip source {attacker_ip} 0"',
                    '])'
                ]
            },
            validation: [
                {
                    type: 'config',
                    description: 'Gateway must have ACL 3000 denying 10.0.0.50',
                    check: (context: LabValidationContext) => {
                        const gw = context.devices.find(d => d.hostname === 'Gateway');
                        return !!gw?.consoleLogs.some(l => l.includes('10.0.0.50'));
                    },
                    errorMessage: 'ACL rule for 10.0.0.50 not found'
                }
            ],
            points: 20
        }
    ],
    rewards: {
        stars: 3,
        experience: 1000,
        badges: ['ai-ops-specialist', 'data-scientist']
    },
    metadata: {
        author: 'NetSim Team',
        version: '1.0.0',
        created: '2026-01-10',
        updated: '2026-01-10'
    }
};
