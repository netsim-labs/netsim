/**
 * CLI Formatters - Functions for formatting CLI output for different vendors
 */

import { NetworkDevice, NetworkPort, CliView } from '../../../types/NetworkTypes';
import { CliVendorProfile, getVendorHelpLines } from '../../../utils/cliProfiles.js';

/**
 * Generate CLI prompt based on device state and view
 */
export const getPrompt = (dev: NetworkDevice): string => {
  if (dev.cliState.view === 'user-view') return `<${dev.hostname}>`;
  if (dev.cliState.view === 'system-view') return `[${dev.hostname}]`;
  if (dev.cliState.view === 'interface-view') {
    const iface = dev.ports.find(p => p.id === dev.cliState.currentInterfaceId);
    return `[${dev.hostname}-${iface?.name ?? 'Interface'}]`;
  }
  if (dev.cliState.view === 'pool-view') return `[${dev.hostname}-ip-pool-${dev.cliState.currentPoolName}]`;
  return `<${dev.hostname}>`;
};

/**
 * Normalize command input using vendor-specific aliases
 */
export const normalizeCommand = (cmd: string, profile: CliVendorProfile): string => {
  const trimmed = cmd.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (profile.aliases[lower]) {
    return profile.aliases[lower];
  }
  if (lower.startsWith('int range')) {
    const rest = trimmed.slice('int range'.length).trim();
    return rest ? `interface range ${rest}` : 'interface range';
  }
  if (lower.startsWith('int ')) {
    return `interface ${trimmed.slice(4)}`;
  }
  if (lower === 'int') {
    return 'interface';
  }
  return trimmed;
};

/**
 * Format help lines for a specific CLI view
 */
export const formatHelpLines = (profile: CliVendorProfile, view: CliView): string[] => {
  const lines = getVendorHelpLines(profile, view);
  return [`Suggested commands for ${view}:`, ...lines.map(cmd => `  ${cmd}`)];
};

/**
 * Format interface summary line
 */
export const formatInterfaceSummary = (port: NetworkPort): string => {
  const name = port.name;
  const status = port.status === 'up' ? 'UP' : 'DOWN';
  const protocol = port.status === 'up' ? 'UP' : 'DOWN';
  const vlan = port.config.vlan ?? 1;
  return `${name.padEnd(18)} ${status.padEnd(8)} ${protocol.padEnd(8)} VLAN ${vlan}`;
};

// ============================================================
// Cisco-specific formatters
// ============================================================

/**
 * Format Cisco VLAN brief output
 */
export const formatCiscoVlanBrief = (dev: NetworkDevice): string[] => {
  const lines: string[] = [];
  lines.push('VLAN Name                             Status    Ports');
  const vlanSet = new Set<number>(dev.vlans);
  vlanSet.add(1);
  const portsByVlan = new Map<number, string[]>();
  dev.ports.forEach(port => {
    const vlanIds = port.config.mode === 'access' ? [port.config.vlan ?? 1] : (port.config.allowedVlans || []);
    vlanIds.forEach(vlan => {
      if (!portsByVlan.has(vlan)) portsByVlan.set(vlan, []);
      portsByVlan.get(vlan)!.push(port.name);
      vlanSet.add(vlan);
    });
  });
  const sortedVlans = Array.from(vlanSet).sort((a, b) => a - b);
  sortedVlans.forEach(vlan => {
    const name = vlan === 1 ? 'default' : `VLAN${vlan}`;
    const status = 'active';
    const ports = portsByVlan.get(vlan)?.join(', ') ?? '';
    lines.push(`${String(vlan).padEnd(4)} ${name.padEnd(32)} ${status.padEnd(8)} ${ports}`);
  });
  return lines;
};

/**
 * Format Cisco IP interface brief output
 */
export const formatCiscoIpInterfaceBrief = (dev: NetworkDevice): string[] => {
  const lines: string[] = [];
  lines.push('Interface              IP-Address      OK? Method Status                Protocol');
  dev.ports.forEach(port => {
    const ip = port.config.ipAddress ?? 'unassigned';
    const status = port.status === 'up' ? 'up' : 'down';
    const protocol = status;
    const method = port.config.ipAddress ? 'manual' : 'unset';
    const ok = port.config.ipAddress ? 'YES' : 'NO';
    lines.push(`${port.name.padEnd(22)} ${ip.padEnd(15)} ${ok.padEnd(3)} ${method.padEnd(6)} ${status.padEnd(20)} ${protocol}`);
  });
  (dev.vlanifs || []).forEach(vlanif => {
    const ip = vlanif.ipAddress ?? 'unassigned';
    const status = vlanif.enabled ? 'up' : 'down';
    lines.push(`${vlanif.id.padEnd(22)} ${ip.padEnd(15)} YES    manual ${status}`);
  });
  return lines;
};

/**
 * Format Cisco IP route output
 */
export const formatCiscoIpRoute = (dev: NetworkDevice): string[] => {
  const lines: string[] = [];
  const defaultRoute = dev.routingTable?.find(r => r.mask === 0);
  if (defaultRoute) {
    lines.push(`Gateway of last resort is ${defaultRoute.nextHop}`);
  }
  lines.push('Codes: C - connected, S - static, O - OSPF');
  lines.push('Destination        Gateway           Flags Metric LocPrf Weight Path');
  (dev.routingTable || []).forEach(route => {
    const code = route.proto === 'OSPF' ? 'O' : route.proto === 'Static' ? 'S' : 'C';
    const dest = `${route.destination}/${route.mask}`;
    const gateway = route.nextHop.padEnd(15);
    lines.push(`${code} ${dest.padEnd(17)} ${gateway} ${route.pre.toString().padEnd(6)} ${route.cost.toString().padEnd(3)} ${route.nextHop}`);
  });
  if (!dev.routingTable?.length) {
    lines.push('No routing entries.');
  }
  return lines;
};

/**
 * Format Cisco running-config output
 */
export const formatCiscoRunningConfig = (dev: NetworkDevice): string[] => {
  const lines: string[] = [];
  lines.push('Building configuration...');
  lines.push('Current configuration : 1.3.5');
  lines.push(`hostname ${dev.hostname}`);
  dev.ports.forEach(port => {
    lines.push('');
    lines.push(`interface ${port.name}`);
    if (port.config.description) lines.push(` description ${port.config.description}`);
    lines.push(port.status === 'down' ? ' shutdown' : ' no shutdown');
    if (port.config.mode === 'access') {
      lines.push(' switchport mode access');
      if (port.config.vlan) lines.push(` switchport access vlan ${port.config.vlan}`);
    } else if (port.config.mode === 'trunk') {
      lines.push(' switchport mode trunk');
      if (port.config.allowedVlans?.length) lines.push(` switchport trunk allowed vlan ${port.config.allowedVlans.join(' ')}`);
    }
  });

  if (dev.netconfEnabled) {
    lines.push('');
    lines.push('netconf-yang');
  }

  return lines;
};

/**
 * Format Cisco version output
 */
export const formatCiscoVersion = (): string[] => [
  'Cisco IOS XE Software, Version 17.15',
  'Copyright (c) 1986-2024 by Cisco Systems, Inc.'
];

/**
 * Format Cisco interface status lines
 */
export const formatCiscoInterfaceStatusLines = (dev: NetworkDevice, filter?: string): string[] => {
  const normalized = filter?.trim().toLowerCase();
  const ports = dev.ports.filter(p => {
    if (!normalized) return true;
    return p.name.toLowerCase().includes(normalized);
  });
  if (!ports.length) {
    return ['No matching interfaces found.'];
  }
  return ports.map(p => {
    const status = p.status === 'up' && p.config.enabled !== false ? 'up' : 'down';
    const vlan = String(p.config.vlan ?? 1);
    const duplex = 'Full';
    const speed = p.speed ? `${p.speed}Mbps` : 'Auto';
    const type = p.type === 'SFP' ? 'SFP' : 'GE';
    return `${p.name.padEnd(12)} ${status.padEnd(7)} ${vlan.padEnd(5)} ${duplex.padEnd(6)} ${speed.padEnd(8)} ${type}`;
  });
};

/**
 * Format Cisco NAT translations output
 */
export const formatCiscoNatLines = (dev: NetworkDevice): string[] => {
  const lines: string[] = [];
  const sessions = dev.natSessions || [];
  if (!sessions.length) {
    lines.push('No NAT translations active.');
  } else {
    lines.push('Inside Local        Inside Global        Protocol   Type');
    sessions.forEach(session => {
      const insideLocalIp = session.privateIp || '*';
      const insideGlobalIp = session.publicIp || '*';
      const insideLocal = `${insideLocalIp}${session.privatePort ? `:${session.privatePort}` : ''}`;
      const insideGlobal = `${insideGlobalIp}${session.publicPort ? `:${session.publicPort}` : ''}`;
      const proto = (session.protocol || 'any').toUpperCase();
      lines.push(`${insideLocal.padEnd(18)} ${insideGlobal.padEnd(18)} ${proto.padEnd(9)} ${session.type.toUpperCase()}`);
    });
  }
  const rules = dev.natRules || [];
  if (rules.length) {
    lines.push('');
    lines.push('Configured NAT rules:');
    rules.forEach(rule => {
      const typeLabel = rule.type === 'static' ? 'STATIC' : 'DYNAMIC';
      const privateSide = `${rule.privateIp ?? '*'}` + (rule.privatePort ? `:${rule.privatePort}` : '');
      const publicSide = `${rule.publicIp}${rule.publicPort ? `:${rule.publicPort}` : ''}`;
      lines.push(`${typeLabel.padEnd(8)} ${privateSide.padEnd(20)} -> ${publicSide}`);
    });
  }
  if (!sessions.length && !rules.length) {
    lines.push('No NAT rules configured.');
  }
  return lines;
};

/**
 * Format Cisco QoS history output
 */
export const formatCiscoQosHistory = (dev: NetworkDevice): string[] => {
  const history = dev.qosHistory || [];
  if (!history.length) return ['No QoS history recorded.'];
  const lines: string[] = [];
  lines.push('Timestamp           Port       Details');
  history.slice(0, 10).forEach(entry => {
    const ts = new Date(entry.timestamp).toISOString().split('T')[1].split('.')[0];
    const portLabel = (entry.portName || 'unknown').padEnd(10);
    const noteLabel = entry.note || '';
    lines.push(`${ts.padEnd(19)} ${portLabel} ${noteLabel}`);
  });
  return lines;
};

/**
 * Format a generic running configuration for export
 */
export const formatRunningConfig = (dev: NetworkDevice): string[] => {
  if (dev.vendor === 'Cisco') return formatCiscoRunningConfig(dev);
  const lines: string[] = [];
  lines.push(`hostname ${dev.hostname}`);
  lines.push(`model ${dev.model}`);
  dev.ports.forEach(port => {
    lines.push('');
    lines.push(`interface ${port.name}`);
    if (port.config.description) lines.push(` description ${port.config.description}`);
    if (port.config.mode === 'access') {
      lines.push(' switchport mode access');
      if (port.config.vlan) lines.push(` switchport access vlan ${port.config.vlan}`);
    } else if (port.config.mode === 'trunk') {
      lines.push(' switchport mode trunk');
      if (port.config.allowedVlans && port.config.allowedVlans.length) {
        lines.push(` switchport trunk allowed vlan ${port.config.allowedVlans.join(' ')}`);
      }
    } else if (port.config.mode === 'hybrid') {
      lines.push(' switchport mode hybrid');
    }
    if (!port.config.enabled) {
      lines.push(' shutdown');
    } else {
      lines.push(' no shutdown');
    }
    if (port.config.ipAddress) {
      const mask = port.config.subnetMask ?? 24;
      lines.push(` ip address ${port.config.ipAddress} ${mask}`);
    }
  });
  (dev.vlanifs || []).forEach(vlanif => {
    lines.push('');
    lines.push(`interface ${vlanif.id}`);
    lines.push(' ip address ' + (vlanif.ipAddress ?? 'unassigned'));
    lines.push(vlanif.enabled ? ' undo shutdown' : ' shutdown');
  });

  if (dev.netconfEnabled) {
    lines.push('');
    lines.push('snetconf server enable');
  }

  return lines;
};

// ============================================================
// Huawei-specific formatters
// ============================================================

/**
 * Format Huawei NAT translations output
 */
export const formatHuaweiNatLines = (dev: NetworkDevice): string[] => {
  const lines: string[] = [];
  const sessions = dev.natSessions || [];
  if (!sessions.length) {
    lines.push('No NAT translations active.');
  } else {
    lines.push('Local               Global              Type');
    sessions.forEach(session => {
      const localIp = session.privateIp || '*';
      const globalIp = session.publicIp || '*';
      const local = `${localIp}${session.privatePort ? `:${session.privatePort}` : ''}`;
      const global = `${globalIp}${session.publicPort ? `:${session.publicPort}` : ''}`;
      lines.push(`${local.padEnd(19)} ${global.padEnd(19)} ${session.type}`);
    });
  }
  const rules = dev.natRules || [];
  if (rules.length) {
    lines.push('');
    lines.push('Configured NAT rules:');
    rules.forEach(rule => {
      const typeLabel = rule.type === 'static' ? 'static' : 'dynamic';
      const privateSide = `${rule.privateIp ?? 'any'}${rule.privatePort ? `:${rule.privatePort}` : ''}`;
      const publicSide = `${rule.publicIp}${rule.publicPort ? `:${rule.publicPort}` : ''}`;
      lines.push(`${typeLabel.padEnd(8)} ${privateSide.padEnd(20)} -> ${publicSide}`);
    });
  }
  if (!sessions.length && !rules.length) {
    lines.push('No NAT rules configured.');
  }
  return lines;
};

// ============================================================
// STP formatters
// ============================================================

/**
 * Format STP flags for a port
 */
export const formatStpFlags = (port: NetworkPort): string => {
  const flags: string[] = [];
  if (port.config.portFast) flags.push('PortFast');
  if (port.bpduGuarded) flags.push('BPDU-Guard');
  if (port.loopGuarded) flags.push('Loop-Guard');
  if (port.bpduFiltered) flags.push('BPDU-Filter');
  return flags.length ? flags.join(', ') : 'Normal';
};

/**
 * Format STP counters for a port
 */
export const formatStpCounters = (port: NetworkPort): string => {
  const counters: string[] = [];
  if (port.bpduGuardHits) counters.push(`BPDU Guard Hits ${port.bpduGuardHits}`);
  if (port.loopGuardHits) counters.push(`Loop Guard Hits ${port.loopGuardHits}`);
  if (port.loopDetected) counters.push('Loop detected');
  return counters.length ? counters.join(' | ') : 'None';
};

// ============================================================
// Utility functions
// ============================================================

/**
 * Expand port range notation (e.g., GE0/0/1-5) to array of ports
 */
export const expandPortRange = (dev: NetworkDevice, rangePart: string): NetworkPort[] => {
  if (!rangePart) return dev.ports;
  const normalized = rangePart.replace(/\s+/g, '');
  if (!normalized) return dev.ports;
  const rangePieces = normalized.split('-').map(piece => piece.trim()).filter(Boolean);
  if (rangePieces.length === 2) {
    const [startPart, endPart] = rangePieces;
    const startPort = dev.ports.find(p => p.name === startPart);
    const inferredEndName =
      startPort?.name.includes('/') ? `${startPort.name.split('/').slice(0, -1).join('/')}/${endPart}` : endPart;
    const endPort = dev.ports.find(p => p.name === inferredEndName) || dev.ports.find(p => p.name.endsWith(endPart));
    if (startPort && endPort) {
      const startIndex = dev.ports.indexOf(startPort);
      const endIndex = dev.ports.indexOf(endPort);
      const [from, to] = startIndex <= endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
      return dev.ports.slice(from, to + 1);
    }
  }
  const tokens = normalized.split(/[,\s]+/).filter(Boolean);
  const matches: NetworkPort[] = [];
  tokens.forEach(token => {
    const match = dev.ports.find(p => p.name === token || p.name.toLowerCase().endsWith(token.toLowerCase()));
    if (match) matches.push(match);
  });
  return matches.length ? matches : dev.ports;
};

/**
 * Get device IP address (first available)
 */
export const getDeviceIp = (dev?: NetworkDevice): string =>
  dev?.ports.find(p => p.config.ipAddress)?.config.ipAddress || dev?.vlanifs?.[0]?.ipAddress || '0.0.0.0';

/**
 * Parse DSCP value from command arguments
 */
export const getDscpFromArgs = (args: string[]): number | undefined => {
  const idx = args.findIndex((arg, index) => index > 0 && arg.toLowerCase() === 'dscp');
  if (idx !== -1 && args[idx + 1]) {
    const parsed = Number.parseInt(args[idx + 1], 10);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 63) return parsed;
  }
  return undefined;
};
