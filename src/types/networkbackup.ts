// src/types/NetworkTypes.ts

export type DeviceType = 'Switch' | 'Router';
export type Vendor = 'Huawei' | 'D-Link';
export type SwitchModel = 'Huawei-S5700-24' | 'Huawei-S5700-48' | 'Router-AR2200';
export type PortType = 'RJ45' | 'SFP' | 'Console';
export type CableType = 'Copper' | 'Fiber';
export type LinkStatus = 'up' | 'down';
export type PortMode = 'access' | 'trunk' | 'hybrid' | 'routed';
export type CliView = 'user-view' | 'system-view' | 'interface-view' | 'pool-view';

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
}

export interface NetworkPort {
  id: string;
  name: string;
  type: PortType;
  status: LinkStatus;
  config: PortConfig;
  sfpModule: SfpModule | null;
  connectedCableId?: string | null;
  speed: number;
}

export interface DhcpPool {
  name: string;
  network: string; // ex: "192.168.10.0"
  mask: number;    // ex: 24
  gateway: string; // ex: "192.168.10.1"
  dns: string;
  usedIps: string[];
}

// --- NEW: Routing Table Structure ---
export interface RouteEntry {
  destination: string; // ex: "10.0.0.0"
  mask: number;        // ex: 24
  proto: 'Direct' | 'Static' | 'OSPF';
  pre: number;         // Preference (0 direct, 60 static)
  cost: number;
  nextHop: string;     // ex: "192.168.1.2" or "127.0.0.1" (local)
  interface: string;   // ex: "GigabitEthernet0/0/1"
}

export interface NetworkDevice {
  id: string;
  vendor: Vendor;
  hostname: string;
  model: SwitchModel;
  ports: NetworkPort[];
  position: { x: number; y: number };

  // Logical State
  vlans: number[];
  consoleLogs: string[];

  // CLI & DHCP & Routing State
  cliState: {
    view: CliView;
    currentInterfaceId?: string | null;
    currentPoolName?: string | null;
  };
  dhcpEnabled: boolean;
  dhcpPools: DhcpPool[];

  // --- NEW: Routing Table ---
  routingTable: RouteEntry[];
}

export interface NetworkCable {
  id: string;
  type: CableType;
  sourceDeviceId: string;
  sourcePortId: string;
  targetDeviceId: string;
  targetPortId: string;
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
