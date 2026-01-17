import { CliView, Vendor, SwitchModel } from '../types/NetworkTypes';

export type CliVendorProfileId = 'huawei' | 'cisco' | 'yunshan' | 'aruba' | 'mikrotik';

type VendorHelpMap = Partial<Record<CliView, string[]>>;

const buildRegistry = (help: VendorHelpMap) => {
  return Array.from(new Set(Object.values(help).flat()));
};

const huaweiHelp: VendorHelpMap = {
  'user-view': [
    'display ip interface brief',
    'display vlan',
    'display ip routing-table',
    'display lldp neighbor brief',
    'display eth-trunk',
    'display mac-address',
    'ping <ip>',
    'return',
    'sysname <name>'
  ],
  'system-view': [
    'sysname <hostname>',
    'vlan batch <ids...>',
    'interface <name>',
    'dhcp enable',
    'ip pool <name>',
    'ip route-static <dest> <mask} <nexthop>',
    'ospf enable',
    'display ip interface brief',
    'display version',
    'display loopback-detect',
    'display alarms',
    'display acl',
    'display nat',
    'nat rule add <name>',
    'nat rule delete <name>'
  ],
  'interface-view': [
    'description <text>',
    'shutdown',
    'undo shutdown',
    'ip address A.B.C.D <mask}',
    'port link-type access|trunk|hybrid|routed',
    'port default vlan <id>',
    'port trunk allow-pass vlan <list>',
    'port-security enable',
    'loopback-detect enable',
    'loopback-detect action <log|shutdown>',
    'undo loopback-detect',
    'eth-trunk <name>',
    'lacp mode <static|active|passive>',
    'qos limit <Mbps}',
    'qos shape <pct}',
    'qos queue add <name} weight <n} dscp <n>',
    'qos queue delete <name>',
    'display qos'
  ],
  'pool-view': [
    'network <ip} mask <mask}',
    'gateway-list <ipv4,ipv4>',
    'dns-list <ip>',
    'excluded-ip <ip>',
    'static-bind <mac} <ip>',
    'lease <seconds>',
    'return'
  ],
  'bgp-view': [
    'peer <ip> as-number <asn>',
    'network <ip> <mask>',
    'router-id <ip>',
    'display bgp peer',
    'return'
  ]
};

const arubaHelp: VendorHelpMap = {
  'user-view': [
    'show ip interface brief',
    'show vlan',
    'show ip route',
    'show mac-address',
    'show running-config',
    'ping <ip>',
    'configure terminal',
    'write memory',
    'return'
  ],
  'system-view': [
    'hostname <name>',
    'vlan <id>',
    'interface <name>',
    'ip route <prefix/mask} <nexthop>',
    'router ospf <id>',
    'show running-config',
    'exit'
  ],
  'interface-view': [
    'description <text>',
    'shutdown',
    'no shutdown',
    'ip address <ip/mask}',
    'vlan access <id>',
    'vlan trunk allowed <list>',
    'exit'
  ],
  'pool-view': [
    'network <ip/mask}',
    'default-gateway <ip>',
    'dns-server <ip>',
    'exit'
  ],
  'bgp-view': [
    'neighbor <ip> remote-as <asn>',
    'network <ip> mask <mask>',
    'exit'
  ]
};

const mikrotikHelp: VendorHelpMap = {
  'user-view': [
    '/ip address print',
    '/interface print',
    '/ip route print',
    '/system resource print',
    '/ping <ip>',
    '/export',
    '/quit'
  ],
  'system-view': [
    '/interface vlan add name=<n} vlan-id=<id} interface=<p>',
    '/ip address add address=<ip/mask} interface=<p>',
    '/ip dhcp-server add name=<n} interface=<p} address-pool=<p>',
    '/routing ospf instance add name=<n} router-id=<ip>',
    '..'
  ],
  'interface-view': [
    'set comment=<text>',
    'disable',
    'enable',
    '..'
  ],
  'pool-view': [
    'add name=<n} ranges=<start-end>',
    '..'
  ],
  'bgp-view': [
    '/routing bgp peer add remote-as=<asn> address=<ip>',
    '..'
  ]
};

const huaweiSuggestions: VendorHelpMap = {
  'user-view': [
    'system-view',
    'display current-configuration',
    'display ip interface brief',
    'display vlan',
    'display ip routing-table',
    'display mac-address',
    'ping',
    '?'
  ],
  'system-view': [
    'quit',
    'return',
    'sysname',
    'vlan batch',
    'interface',
    'save',
    '?'
  ],
  'interface-view': [
    'description',
    'shutdown',
    'undo shutdown',
    'ip address',
    'port link-type',
    '?'
  ],
  'pool-view': [
    'network',
    'gateway-list',
    'dns-list',
    'exit',
    '?'
  ],
  'bgp-view': [
    'peer',
    'network',
    'router-id',
    'return',
    '?'
  ]
};

const ciscoHelp: VendorHelpMap = {
  'user-view': [
    'show ip interface brief',
    'show vlan brief',
    'show ip route',
    'show mac address-table',
    'show running-config',
    'show version',
    'ping <ip>',
    'configure terminal',
    'copy running-config startup-config',
    'return',
    'exit',
    '?'
  ],
  'system-view': [
    'interface GigabitEthernet0/0',
    'interface range GigabitEthernet0/0 - 0/3',
    'ip route <dest> <mask} <nexthop>',
    'show running-config',
    'show ip route',
    'shutdown',
    'no shutdown',
    'exit',
    '?'
  ],
  'interface-view': [
    'description <text>',
    'shutdown',
    'no shutdown',
    'ip address <ip} <mask}',
    'switchport mode access',
    'switchport mode trunk',
    'switchport access vlan <id>',
    'switchport trunk allowed vlan <list>',
    'exit',
    '?'
  ],
  'pool-view': [
    'ip dhcp pool <name>',
    'network <ip} <mask}',
    'default-router <ip>',
    'dns-server <ip>',
    'exit',
    '?'
  ],
  'bgp-view': [
    'neighbor <ip> remote-as <asn>',
    'network <ip> mask <mask>',
    'exit',
    '?'
  ]
};

const huaweiAliases: Record<string, string> = {
  'dis ip int br': 'display ip interface brief',
  'dis ip interface brief': 'display ip interface brief',
  'dis vlan': 'display vlan',
  'dis ip ro': 'display ip routing-table',
  'dis cu': 'display current-configuration',
  'dis ver': 'display version',
  'dis mac': 'display mac-address',
  'int range': 'interface range'
};

const ciscoAliases: Record<string, string> = {
  'sh ip int br': 'display ip interface brief',
  'show ip interface brief': 'display ip interface brief',
  'sh vlan brief': 'display vlan',
  'show vlan brief': 'display vlan',
  'show ip route': 'display ip routing-table',
  'show running-config': 'display current-configuration',
  'copy running-config startup-config': 'save',
  'conf t': 'system-view',
  'configure terminal': 'system-view',
  'exit': 'return'
};

const yunshanHelp: VendorHelpMap = {
  'user-view': [
    ...(huaweiHelp['user-view'] || []),
    'commit',
    'display commit-queue'
  ],
  'system-view': [
    ...(huaweiHelp['system-view'] || []),
    'commit',
    'abort',
    'display candidate-configuration'
  ],
  'interface-view': [
    ...(huaweiHelp['interface-view'] || []),
    'commit',
    'display this'
  ],
  'pool-view': [
    ...(huaweiHelp['pool-view'] || []),
    'commit'
  ],
  'bgp-view': [
    ...(huaweiHelp['bgp-view'] || []),
    'commit'
  ]
};

const yunshanSuggestions: VendorHelpMap = {
  ...huaweiSuggestions,
  'system-view': [
    ...(huaweiSuggestions['system-view'] || []),
    'commit',
    'abort'
  ]
};

const yunshanAliases: Record<string, string> = {
  ...huaweiAliases,
  'dis th': 'display this',
  'com': 'commit'
};

export interface CliVendorProfile {
  id: CliVendorProfileId;
  label: string;
  description: string;
  help: VendorHelpMap;
  suggestions: VendorHelpMap;
  aliases: Record<string, string>;
  registry: string[];
}

const vendorProfiles: Record<CliVendorProfileId, CliVendorProfile> = {
  huawei: {
    id: 'huawei',
    label: 'Huawei VRP',
    description: 'Huawei VRP style CLI with hierarchical views.',
    help: huaweiHelp,
    suggestions: huaweiSuggestions,
    aliases: huaweiAliases,
    registry: buildRegistry(huaweiHelp)
  },
  cisco: {
    id: 'cisco',
    label: 'Cisco IOS',
    description: 'Cisco IOS/IOS XE stack.',
    help: ciscoHelp,
    suggestions: huaweiSuggestions, // reuse for now
    aliases: ciscoAliases,
    registry: buildRegistry(ciscoHelp)
  },
  yunshan: {
    id: 'yunshan',
    label: 'YunShan OS',
    description: 'Huawei CloudEngine CLI with candidate/commit support.',
    help: yunshanHelp,
    suggestions: yunshanSuggestions,
    aliases: yunshanAliases,
    registry: buildRegistry(yunshanHelp)
  },
  aruba: {
    id: 'aruba',
    label: 'Aruba AOS-CX',
    description: 'Aruba modern CLI (CX series).',
    help: arubaHelp,
    suggestions: huaweiSuggestions, // reuse
    aliases: ciscoAliases, // reuse some like conf t
    registry: buildRegistry(arubaHelp)
  },
  mikrotik: {
    id: 'mikrotik',
    label: 'MikroTik RouterOS',
    description: 'MikroTik path-based CLI.',
    help: mikrotikHelp,
    suggestions: huaweiSuggestions, // reuse
    aliases: {},
    registry: buildRegistry(mikrotikHelp)
  }
};

export const vendorProfilesList = Object.values(vendorProfiles);

const isCiscoModel = (model?: SwitchModel) => Boolean(model?.startsWith('Cisco-'));
const isArubaModel = (model?: SwitchModel) => Boolean(model?.startsWith('Aruba-'));
const isMikroTikModel = (model?: SwitchModel) => Boolean(model?.startsWith('MikroTik-'));

interface VendorDetectionRule {
  id: CliVendorProfileId;
  matches: (vendor?: Vendor, model?: SwitchModel) => boolean;
}

const vendorDetectionRules: VendorDetectionRule[] = [
  {
    id: 'cisco',
    matches: (_, model) => isCiscoModel(model)
  },
  {
    id: 'yunshan',
    matches: (_, model) => model === 'Huawei-CE6800' || (model as string)?.includes('CE')
  },
  {
    id: 'aruba',
    matches: (_, model) => isArubaModel(model)
  },
  {
    id: 'mikrotik',
    matches: (_, model) => isMikroTikModel(model)
  },
  {
    id: 'huawei',
    matches: () => true
  }
];

export const getVendorProfile = (vendor?: Vendor, model?: SwitchModel): CliVendorProfile => {
  const rule = vendorDetectionRules.find(r => r.matches(vendor, model));
  return rule ? vendorProfiles[rule.id] : vendorProfiles.huawei;
};

export const getVendorHelpLines = (profile: CliVendorProfile, view: CliView): string[] => {
  return profile.help[view] ?? profile.help['user-view'] ?? [];
};

export const getVendorCommandSuggestions = (profile: CliVendorProfile, input: string): string[] => {
  if (!input) return [];
  const norm = input.toLowerCase();
  return profile.registry.filter(cmd => cmd.toLowerCase().startsWith(norm)).slice(0, 5);
};

export const getVendorBaseSuggestions = (profile: CliVendorProfile, view: CliView): string[] => {
  return profile.suggestions[view] ?? profile.suggestions['user-view'] ?? [];
};
