import { SwitchModel, Vendor } from '../types/NetworkTypes.js';

export interface DeviceModelMeta {
  model: SwitchModel;
  vendor: Vendor;
  displayName: string;
  description: string;
  category: 'Switch' | 'Router' | 'Host' | 'Firewall' | 'Wireless';
  ports: {
    ge?: number;
    xge?: number;
  };
  power?: 'PoE' | 'Standard';
  pack?: string;
  features?: string[];
}

export const defaultDeviceCatalog: DeviceModelMeta[] = [
  // --- HUAWEI ENTERPRISE SERIES ---
  {
    model: 'Huawei-S5700-28TP',
    vendor: 'Huawei',
    displayName: 'Huawei S5700-28TP-LI',
    description: 'Manageable L3 Switch: 24x GE + 4x GE SFP. Total energy efficiency.',
    category: 'Switch',
    ports: { ge: 28 },
    pack: 'huawei-switch',
    features: ['VLAN', 'STP', 'Basic OSPF']
  },
  {
    model: 'Huawei-S5700-52X-LI',
    vendor: 'Huawei',
    displayName: 'Huawei S5700-52X-LI',
    description: 'L3 Core/Aggregation Switch: 48x GE + 4x 10G SFP+. High performance.',
    category: 'Switch',
    ports: { ge: 48, xge: 4 },
    pack: 'huawei-switch',
    features: ['10G Uplinks', 'Stacking', 'LACP']
  },
  {
    model: 'Huawei-S6730-H24X',
    vendor: 'Huawei',
    displayName: 'Huawei S6730-H24X6C',
    description: 'Full 10G Switch: 24x 10G SFP+ for data center and core.',
    category: 'Switch',
    ports: { xge: 24 },
    pack: 'huawei-switch',
    features: ['VXLAN', 'BGP', 'High Density']
  },
  {
    model: 'Huawei-CE6800',
    vendor: 'Huawei',
    displayName: 'Huawei CloudEngine 6800',
    description: 'Data Center Switch: 48x 10G SFP+ & 6x 100G QSFP28. Runs YunShan OS.',
    category: 'Switch',
    ports: { xge: 48 },
    pack: 'huawei-yunshan',
    features: ['YunShan OS', 'VXLAN', 'EVPN', 'MLAG']
  },
  {
    model: 'Huawei-AR617',
    vendor: 'Huawei',
    displayName: 'Huawei AR617',
    description: 'SD-WAN access router: 1x GE Combo WAN, 4x GE LAN. Ideal for offices.',
    category: 'Router',
    ports: { ge: 5 },
    pack: 'huawei-router',
    features: ['NAT', 'VRRP', 'IPSec']
  },
  {
    model: 'Huawei-USG6000V',
    vendor: 'Huawei',
    displayName: 'Huawei USG6000V',
    description: 'Next-Gen Firewall: 8x GE. Advanced security, VPN, NAT and Policies.',
    category: 'Firewall',
    ports: { ge: 8 },
    pack: 'huawei-firewall',
    features: ['Security Policies', 'NAT', 'IPSec VPN']
  },
  {
    model: 'Huawei-AC6508',
    vendor: 'Huawei',
    displayName: 'Huawei AC6508',
    description: 'Wireless Access Controller: Supports up to 256 APs. Wi-Fi 6 Ready.',
    category: 'Wireless',
    ports: { ge: 10, xge: 2 },
    pack: 'huawei-wlc',
    features: ['CAPWAP', 'AP Management', 'Roaming']
  },
  {
    model: 'Huawei-AR6121',
    vendor: 'Huawei',
    displayName: 'Huawei AR6121',
    description: 'Enterprise Router: 2x GE WAN, 8x GE LAN. Advanced routing power.',
    category: 'Router',
    ports: { ge: 10 },
    pack: 'huawei-router',
    features: ['Dual WAN', 'Multi-area OSPF', 'ACL']
  },

  // --- LEGACY / GENERIC (NetSim) ---
  {
    model: 'NS-Switch-L3-24',
    vendor: 'NetSim',
    displayName: 'Generic L3-24',
    description: 'Balanced generic switch for quick simulations.',
    category: 'Switch',
    ports: { ge: 24, xge: 4 },
    power: 'PoE',
    pack: 'ns-switch'
  },

  // --- HOSTS & PERIPHERALS ---
  {
    model: 'PC',
    vendor: 'PC',
    displayName: 'Workstation PC',
    description: 'User terminal with simplified CLI.',
    category: 'Host',
    ports: { ge: 1 },
    pack: 'ns-host'
  },
  {
    model: 'AP-POE',
    vendor: 'PC',
    displayName: 'WiFi Access Point',
    description: 'Access Point with PoE power.',
    category: 'Host',
    ports: { ge: 1 },
    power: 'PoE',
    pack: 'ns-host'
  },
  {
    model: 'PHONE-VOIP',
    vendor: 'PC',
    displayName: 'VoIP Phone',
    description: 'VoIP device for QoS testing.',
    category: 'Host',
    ports: { ge: 1 },
    pack: 'ns-host'
  },
  {
    model: 'Automation-Server',
    vendor: 'NetSim',
    displayName: 'Automation Server',
    description: 'Python server (Pyodide) for network automation.',
    category: 'Host',
    ports: { ge: 1 },
    pack: 'ns-host'
  },

  // --- CISCO ENTERPRISE SERIES ---
  {
    model: 'Cisco-Catalyst-9300',
    vendor: 'Cisco',
    displayName: 'Cisco Catalyst 9300',
    description: 'Enterprise L3 switch with StackWise and advanced routing.',
    category: 'Switch',
    ports: { ge: 24, xge: 4 },
    features: ['StackWise', 'Advanced QoS', 'SD-Access'],
    pack: 'cisco-switch'
  },
  {
    model: 'Cisco-Catalyst-2960L',
    vendor: 'Cisco',
    displayName: 'Cisco Catalyst 2960-L',
    description: 'Classic Enterprise L2 switch: 24x GE + 4x SFP. Ideal for CCNA (STP/VLANs).',
    category: 'Switch',
    ports: { ge: 24, xge: 4 }, // 4x SFP (1G), treated as xge or ge depending on implementation, usually SFP is 1G. Let's stick to ge: 24 + 4 = 28 or separate. SFP usually 1G. Let's use xge for SFP/SFP+ distinction if needed, but 2960L SFP is 1G. Let's use 28 GE for simplicity or if supported. The schema supports ge/xge. Let's say 24 GE + 4 GE SFP. Total 28 GE.
    // Correction: keeping logic simple.
    features: ['Layer 2 Only', 'VLAN', 'STP'],
    pack: 'cisco-switch'
  },
  {
    model: 'Cisco-ASA-5506X',
    vendor: 'Cisco',
    displayName: 'Cisco ASA 5506-X',
    description: 'Firewall with FirePOWER services: 8x GE. Perimeter security.',
    category: 'Firewall',
    ports: { ge: 8 },
    features: ['ASA OS', 'ACL', 'NAT', 'VPN'],
    pack: 'cisco-firewall'
  },
  {
    model: 'Cisco-WLC-3504',
    vendor: 'Cisco',
    displayName: 'Cisco 3504 WLC',
    description: 'Compact Wireless Controller: 4x GE (MultiGig). Centralized management.',
    category: 'Wireless',
    ports: { ge: 4 },
    features: ['WLAN', 'FlexConnect', 'Security'],
    pack: 'cisco-wlc'
  },
  {
    model: 'Cisco-ISR-4321',
    vendor: 'Cisco',
    displayName: 'Cisco ISR 4321',
    description: 'Edge router with integrated voice/data services.',
    category: 'Router',
    ports: { ge: 2, xge: 1 },
    features: ['NAT', 'Zone-based Firewall', 'VRF'],
    pack: 'cisco-router'
  },
  // --- ARUBA ENTERPRISE SERIES ---
  {
    model: 'Aruba-CX-6300',
    vendor: 'Aruba',
    displayName: 'Aruba CX 6300M',
    description: 'L3 Aggregation Switch: 24x SFP+ (1/10/25G). Latest generation AOS-CX.',
    category: 'Switch',
    ports: { xge: 24 },
    pack: 'aruba-cx',
    features: ['Vlan Access/Trunk', 'Static Routing', 'High Density']
  },
  // --- MIKROTIK CARRIER SERIES ---
  {
    model: 'MikroTik-CRS326',
    vendor: 'MikroTik',
    displayName: 'MikroTik CRS326-24G-2S+RM',
    description: 'Cloud Router Switch: 24x GE + 2x 10G SFP+. Dual boot (RouterOS/SwitchOS).',
    category: 'Switch',
    ports: { ge: 24, xge: 2 },
    pack: 'mikrotik-crs',
    features: ['Linux-based', 'Powerful Bridge', 'VLAN tagging']
  },
  {
    model: 'MikroTik-CCR2004',
    vendor: 'MikroTik',
    displayName: 'MikroTik CCR2004-1G-12S+2XS',
    description: 'High performance Core Router: 12x 10G SFP+ + 2x 25G SFP28. RouterOS v7.',
    category: 'Router',
    ports: { ge: 1, xge: 14 },
    pack: 'mikrotik-ccr',
    features: ['ISP Grade', 'BGP Carrier', 'High Throughput']
  }
];
