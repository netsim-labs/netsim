// src/types/NetworkTypes.ts

export type DeviceType = 'Switch' | 'Router' | 'PC' | 'AP' | 'Firewall' | 'Wireless';
export type Vendor = 'Huawei' | 'Cisco' | 'D-Link' | 'NetSim' | 'PC' | 'Router' | 'Aruba' | 'MikroTik';
export type SwitchModel =
  | 'Huawei-S5700-28TP' | 'Huawei-S5700-52X-LI' | 'Huawei-S6730-H24X' | 'Huawei-CE6800' | 'Huawei-AR617' | 'Huawei-AR6121'
  | 'NS-Switch-L3-24' | 'NS-Switch-L3-48' | 'NS-Router-IM8' | 'NS-Router-4G'
  | 'Cisco-Catalyst-9300' | 'Cisco-Catalyst-9200' | 'Cisco-ISR-4321' | 'Cisco-ISR-4451'
  | 'Huawei-USG6000V' | 'Cisco-ASA-5506X' | 'Huawei-AC6508' | 'Cisco-WLC-3504' | 'Cisco-Catalyst-2960L'
  | 'PC' | 'AP-POE' | 'PHONE-VOIP' | 'NS-Switch-L3-24-POE' | 'NS-Switch-L3-24SFP'
  | 'D-Link-DGS-1210' | 'D-Link-DGS-1510' | 'Aruba-2930F' | 'Aruba-5400R' | 'Aruba-CX-6300' | 'MikroTik-CRS326' | 'MikroTik-CCR2004'
  | 'Automation-Server';
export type PortType = 'RJ45' | 'SFP' | 'Console';
export type CableType = 'Copper' | 'Fiber';
export type LinkStatus = 'up' | 'down';
export type PortMode = 'access' | 'trunk' | 'hybrid' | 'routed';
export type CliView =
  | 'user-view' | 'system-view' | 'interface-view' | 'bgp-view' | 'pool-view'
  | 'zone-view' | 'aaa-view' | 'acl-view'
  // Security Policy Views
  | 'security-policy-view' | 'security-rule-view'
  // AAA Views
  | 'auth-scheme-view' | 'radius-view' | 'tacacs-view'
  // SSL VPN Views
  | 'sslvpn-context-view';

// Security Feature Removed
// import type { SecurityFeatureState } from '../features/security/types';

// BGP Configuration Types
export interface BgpNeighbor {
  ip: string;
  remoteAs: number;
  state: 'Idle' | 'Connect' | 'Active' | 'OpenSent' | 'OpenConfirm' | 'Established';
  uptime?: number;
  description?: string;
  isClient?: boolean; // Route Reflector Client
  nextHopSelf?: boolean;
  password?: string;
  holdTime?: number;
  keepAliveTime?: number;
}

export interface BgpConfig {
  asNumber: number;
  routerId?: string;
  clusterId?: string; // For RR
  neighbors: BgpNeighbor[];
  networks: string[];
  enabled: boolean;
  evpnEnabled?: boolean; // NEW: BGP EVPN Address Family
  defaultLocalPreference?: number;
  confederationId?: number;
  confederationPeers?: number[];
}

export interface VxlanVni {
  vni: number;
  vtepIp: string;
  vlanId?: number;
  bdId?: number;
}

export interface BridgeDomain {
  id: number;
  vni?: number;
  vlanId?: number;
  description?: string;
}



export interface SfpModule {
  id: string;
  model: '10G-SR' | '10G-LR';
  speed: number;
  distance: number;
}

export interface PortConfig {
  vlan?: number;
  allowedVlans?: number[];
  mode: PortMode;
  ipAddress?: string;
  subnetMask?: number;
  enabled: boolean;
  description?: string;
  qos?: {
    limitMbps?: number;
    shapePct?: number;
    queues?: QosQueue[];
  };
  portSecurity?: any;
  bpduGuard?: boolean;
  bpduFilter?: boolean;
  portFast?: boolean;
  loopGuard?: boolean;
  loopDetectEnabled?: boolean;
  bpduGuarded?: boolean;
  bpduFiltered?: boolean;
  loopDetected?: boolean;
  loopGuarded?: boolean;
  bpduGuardHits?: number;
  loopGuardHits?: number;
  bpduFilterHits?: number;
  loopLastEvent?: any;
  ethTrunkId?: string;
  trunkId?: string;
  helperAddresses?: string[];
  dhcpLease?: any;
  poePowered?: boolean;
  qinqTunnel?: any;
  loopDetectAction?: string;
  qosUsage?: { windowStart: number; bytes: number };
}

export interface NetworkPort {
  id: string;
  name: string;
  type: PortType;
  status: LinkStatus;
  config: PortConfig;
  sfpModule?: SfpModule | null;
  connectedCableId?: string | null;
  speed?: number;
  stpStatus?: any;
  stpRole?: any;
  loopDetectEnabled?: boolean;
  loopDetected?: boolean;
  bpduGuarded?: boolean;
  bpduGuardHits?: number;
  loopGuarded?: boolean;
  loopGuardHits?: number;
  bpduFiltered?: boolean;
  ethTrunkId?: string;
  poePowered?: boolean;
  loopLastEvent?: any;
}

export interface DhcpPool {
  id?: string;
  name: string;
  network: string; // ex: "192.168.10.0"
  mask: number;    // ex: 24
  gateway: string; // ex: "192.168.10.1"
  dns: string;
  usedIps: string[];
  leases?: any[];
  excluded?: string[];
  staticBindings?: any[];
  leaseSeconds?: number;
}

// --- NEW: Routing Table Structure ---
export interface RouteEntry {
  destination: string; // ex: "10.0.0.0"
  mask: number;        // ex: 24
  proto: 'Direct' | 'Static' | 'OSPF' | 'BGP';
  pre: number;         // Preference (0 direct, 60 static)
  cost: number;
  nextHop: string;     // ex: "192.168.1.2" or "127.0.0.1" (local)
  interface: string;   // ex: "GigabitEthernet0/0/1"
  // BGP Attributes
  bgpAttributes?: {
    localPref?: number;
    asPath?: number[];
    origin?: 'IGP' | 'EGP' | 'Incomplete';
    med?: number;
    communities?: string[];
    weight?: number; // Cisco specific
    atomicAggregate?: boolean;
    aggregator?: { as: number; id: string };
  };
}

export interface ContainerlabConfig {
  kind: string; // e.g., 'ceos', 'srl', 'linux'
  image: string; // e.g., 'ceos:4.28.0F'
  binds?: string[]; // e.g., ['config:/config']
  env?: Record<string, string>;
  cmd?: string;
}

export interface NetworkDevice {
  id: string;
  type: DeviceType; // Added missing prop
  status?: string;  // Added missing prop
  vendor: Vendor;
  hostname: string;
  model: SwitchModel;
  ports: NetworkPort[];
  position: { x: number; y: number };
  candidateState?: any; // Staged configuration for YunShan OS (clone of NetworkDevice)

  // Containerlab Integration
  containerlab?: ContainerlabConfig;

  // Logical State
  vlans: number[];
  consoleLogs: string[];

  // CLI & DHCP & Routing State
  cliState: {
    view: CliView;
    currentInterfaceId?: string | null;
    currentPoolName?: string | null;
    bgpView?: string | null; // For BGP configuration mode
  };
  dhcpEnabled?: boolean;
  dhcpPools?: DhcpPool[];

  // --- NEW: Routing Table ---
  routingTable?: RouteEntry[];

  // Additional properties used by the code
  macAddress?: string;
  ospfEnabled?: boolean;
  ospfNeighbors?: OspfNeighbor[];
  ospfLsdb?: any[];
  ospfTimers?: any;
  ospfRole?: any;
  routerId?: string;
  stpPriority?: number;
  defaultGateway?: string;
  vlanifs?: VlanInterface[];

  ethTrunks?: EthTrunk[];
  lldpNeighbors?: LldpNeighbor[];
  lastConfigSave?: number;
  hasInternet?: boolean;
  natRules?: NatRule[];
  aclRules?: AclRule[];
  dnsServers?: string[];
  natSessions?: NatSession[];
  qosHistory?: QosHistoryEntry[];
  startupConfigVersion?: number;
  stpEnabled?: boolean;
  stpMode?: 'stp' | 'rstp' | 'mstp';
  bgpConfig?: BgpConfig;
  vxlanVnis?: VxlanVni[];         // NEW: VXLAN Virtual Network Identifiers
  bridgeDomains?: BridgeDomain[]; // NEW: Huawei BD configuration
  securityState?: any; // Stubbed

  // Programmatic Management
  netconfEnabled?: boolean;
  netconfConfig?: {
    port: number;
    sshEnabled: boolean;
  };
  restconfEnabled?: boolean;
  restconfConfig?: {
    port: number;
    secure: boolean;
    rootPath: string;
  };
}

export interface NetworkCable {
  id: string;
  type: CableType;
  sourceDeviceId: string;
  sourcePortId: string;
  targetDeviceId: string;
  targetPortId: string;
  trunkId?: string;
}

export interface OperationResult {
  success: boolean;
  message: string;
}

export interface PortSelection {
  deviceId: string;
  portId: string;
  portType: PortType;
}

// Additional interfaces used by the code
export interface OspfNeighbor {
  neighborId: string;
  interface: string;
  state: string;
  address?: string;
}

export interface VrrpGroup {
  id: string;
  virtualIp?: string;
  priority: number;
  state: 'MASTER' | 'BACKUP';
  advertiseInterval: number;
  preemptMode: boolean;
  preemptDelay: number;
}

export interface VlanInterface {
  id: string;
  vlanId: number;
  enabled: boolean;
  ipAddress?: string;
  subnetMask?: number;
  description?: string;
  vrrp?: VrrpGroup[];
}

export interface EthTrunk {
  id: string;
  name: string;
  mode: LacpMode;
  members: string[];
  enabled: boolean;
  description?: string;
  ipAddress?: string;
  subnetMask?: number;
  lacpKey?: number;
  systemPriority?: number;
  lacpEnabled?: boolean;
  ports?: Record<string, LacpPortState>;
  actorState?: LacpState;
  partnerState?: LacpState;
  partner?: any;
  lastLacpPdu?: number;
  actor?: any;
}

export interface LldpNeighbor {
  id: string;
  localPort: string;
  remoteDevice: string;
  remotePort: string;
  capabilities: string;
  chassisId?: string;
  portDescription?: string;
}

export interface StpStatus {
  role: 'root' | 'designated' | 'alternate' | 'backup';
  state: 'forwarding' | 'learning' | 'listening' | 'blocking' | 'disabled';
  priority: number;
}

export interface AlarmEvent {
  id: string;
  deviceId?: string;
  deviceName?: string;
  portName?: string;
  type: 'dhcp' | 'port-security' | 'loop-detect' | 'loop-guard' | 'bpdu-guard' | 'poe' | 'bgp';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

export type LacpMode = 'static' | 'lacp' | 'active' | 'passive';

export type LacpState = 'down' | 'expired' | 'defaulted' | 'bundled' | 'collecting' | 'distributing' | 'standby';

export interface LacpActorState {
  activity: number;
  timeout: number;
  aggregation: number;
  synchronization: number;
  collecting: number;
  distributing: number;
  defaulted: number;
  expired: number;
}

export interface LacpActorInfo {
  systemId: string;
  systemPriority: number;
  portId: number;
  portPriority: number;
  key: number;
  state: LacpActorState;
}

export interface LacpPartnerInfo {
  systemId: string;
  systemPriority: number;
  portId: number;
  portPriority: number;
  key: number;
  state: number;
}

export interface LacpPortState {
  actor: LacpActorInfo;
  partner: LacpPartnerInfo;
  state: LacpState;
  selected: boolean;
  standby: boolean;
}

export interface LacpPortInfo {
  portId: string;
  systemId: string;
  systemPriority: number;
  portPriority: number;
  portNumber: number;
  lacpEnabled: boolean;
}

// Lab Gamificado Types
export interface LabStep {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  commands: {
    huawei?: string[];
    cisco?: string[];
  };
  validation: LabValidation[];
  hints?: string[];
  points: number;
}

export interface LabValidation {
  type: 'command' | 'topology' | 'connectivity' | 'config';
  description: string;
  check: (context: LabValidationContext) => boolean;
  errorMessage: string;
}

export interface LabValidationContext {
  devices: NetworkDevice[];
  cables: NetworkCable[];
  commands: string[];
  topology: any;
}

export interface Lab {
  id: string;
  title: string;
  description: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  certification: 'ccna' | 'hcia' | 'hcip' | 'hcie';
  estimatedTime: number; // minutes
  prerequisites: string[];
  objectives: string[];
  topology: LabTopology;
  steps: LabStep[];
  rewards: {
    stars: number;
    experience: number;
    badges?: string[];
  };
  metadata: {
    author: string;
    version: string;
    created: string;
    updated: string;
  };
}

export interface LabTopology {
  devices: {
    type: string;
    count: number;
    config?: any;
  }[];
  connections: {
    from: string;
    to: string;
    type: 'copper' | 'fiber';
  }[];
}

export interface LabProgress {
  labId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  currentStep: number;
  completedSteps: string[];
  score: number;
  maxScore: number;
  stars: number;
  attempts: number;
  timeSpent: number; // seconds
  hintsUsed: number;
  validationsPassed: string[];
  validationsFailed: string[];
}

export interface LabSession {
  labId: string;
  progress: LabProgress;
  topologySnapshot: {
    devices: NetworkDevice[];
    cables: NetworkCable[];
  };
  commandHistory: string[];
  validationResults: {
    stepId: string;
    validations: {
      id: string;
      passed: boolean;
      errorMessage?: string;
    }[];
  }[];
  // Exam Mode
  isExamMode?: boolean;
  examStartTime?: number;
  examTimeLimit?: number; // seconds
  examStrikes?: number;
}

// Additional types for CLI and features
export interface AclRule {
  id: string;
  name?: string;
  action: 'permit' | 'deny';
  protocol: string;
  source: string;
  destination: string;
  ports?: string;
  srcCidr?: string;
  dstCidr?: string;
  srcPort?: number;
  dstPort?: number;
  interfaceId?: string;
  direction?: string;
  hits?: number;
}

export interface NatRule {
  id: string;
  type: 'static' | 'dynamic';
  name?: string;
  privateIp?: string;
  publicIp?: string;
  interfaceId?: string;
  protocol?: string;
  pat?: boolean;
  publicPort?: number;
  privatePort?: number;
  hits?: number;
}

export interface NatSession {
  id: string;
  ruleId?: string;
  type: string;
  privateIp: string;
  privatePort?: number;
  publicIp?: string;
  publicPort?: number;
  protocol: string;
  createdAt: number;
  lastUsed: number;
}

export interface QosHistoryEntry {
  id?: string;
  timestamp: number;
  interface?: string;
  bytes?: number;
  packets?: number;
  drops?: number;
  portName?: string;
  note?: string;
  limit?: number;
  shape?: number;
  queueName?: string;
  queueDscp?: number;
  queueWeight?: number;
}

export interface PacketTraceAclHit {
  ruleId: string;
  action: 'permit' | 'deny';
  reason: string;
  deviceId?: string;
  label?: string;
  count: number;
}

export interface QosQueue {
  name: string;
  weight: number;
  dscp: number;
}

export interface PacketTrace {
  id?: string;
  source?: string;
  destination?: string;
  protocol?: string;
  aclHits?: PacketTraceAclHit[];
  path?: any[];
  srcDeviceId?: string;
  dstDeviceId?: string;
  summary?: string;
  reason?: string;
  srcIp?: string;
  dstIp?: string;
}
