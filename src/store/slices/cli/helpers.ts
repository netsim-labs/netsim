/**
 * CLI Helpers - Functions for ACL, NAT, QoS and other CLI operations
 */

import {
  NetworkDevice,
  NetworkCable,
  NetworkPort,
  NatRule,
  NatSession,
  QosHistoryEntry,
  AclRule
} from '../../../types/NetworkTypes';
import { generateUUID } from '../../../utils/common';

// ============================================================
// Types
// ============================================================

export interface AclHit {
  deviceId: string;
  ruleId: string;
}

export interface QosTraceEntry {
  portName: string;
  deviceName: string;
  limit?: number;
  shape?: number;
  queueName?: string;
  queueWeight?: number;
  queueDscp?: number;
  deviceId?: string;
  portId?: string;
}

// ============================================================
// IP and CIDR utilities
// ============================================================

/**
 * Convert IP address string to 32-bit integer
 */
export const ipToInt = (ip: string): number =>
  ip.split('.').reduce((acc, oct) => (acc << 8) + Number.parseInt(oct, 10), 0) >>> 0;

/**
 * Check if an IP matches a CIDR notation
 */
export const matchesCidr = (ip: string, cidr?: string): boolean => {
  if (!cidr) return true;
  const [network, maskStr] = cidr.split('/');
  const mask = Number.parseInt(maskStr, 10) || 32;
  const ipNum = ipToInt(ip);
  const netNum = ipToInt(network);
  const maskBits = mask === 0 ? 0 : (~0 << (32 - mask)) >>> 0;
  return (ipNum & maskBits) === (netNum & maskBits);
};

/**
 * Check if protocol matches (case-insensitive, undefined matches all)
 */
export const matchesProtocol = (ruleProto: string | undefined, proto: string | undefined): boolean => {
  if (!ruleProto) return true;
  if (!proto) return ruleProto === 'any';
  return ruleProto.toLowerCase() === proto.toLowerCase() || ruleProto === 'any';
};

/**
 * Check if port value matches (undefined matches all)
 */
export const matchesPortValue = (rulePort: number | undefined, port: number | undefined): boolean => {
  if (rulePort === undefined) return true;
  return rulePort === port;
};

// ============================================================
// ACL Functions
// ============================================================

/**
 * Find matching ACL rule for a given traffic flow
 */
export const findRuleMatch = (
  rules: AclRule[] | undefined,
  portId: string,
  direction: 'in' | 'out',
  srcIp: string,
  dstIp: string,
  proto?: string,
  srcPort?: number,
  dstPort?: number
): AclRule | undefined => {
  if (!rules?.length) return undefined;
  return rules.find(rule => {
    if (rule.interfaceId !== portId) return false;
    if (rule.direction !== direction) return false;
    if (!matchesCidr(srcIp, rule.srcCidr)) return false;
    if (!matchesCidr(dstIp, rule.dstCidr)) return false;
    if (!matchesProtocol(rule.protocol, proto)) return false;
    if (!matchesPortValue(rule.srcPort, srcPort)) return false;
    if (!matchesPortValue(rule.dstPort, dstPort)) return false;
    return true;
  });
};

/**
 * Evaluate ACL rules along a path
 */
export const evaluateAclPath = (
  path: string[],
  devices: NetworkDevice[],
  cables: NetworkCable[],
  sourceId: string,
  srcIp: string,
  dstIp: string,
  proto?: string,
  srcPort?: number,
  dstPort?: number
): { blocked: boolean; message: string; hits: AclHit[] } => {
  const hits: AclHit[] = [];
  let currentId = sourceId;
  for (const cableId of path) {
    const cable = cables.find(c => c.id === cableId);
    if (!cable) continue;
    const isSrc = cable.sourceDeviceId === currentId;
    const nextId = isSrc ? cable.targetDeviceId : cable.sourceDeviceId;
    const outPort = isSrc ? cable.sourcePortId : cable.targetPortId;
    const inPort = isSrc ? cable.targetPortId : cable.sourcePortId;
    const srcDev = devices.find(d => d.id === currentId);
    const dstDev = devices.find(d => d.id === nextId);
    const outRule = findRuleMatch(srcDev?.aclRules, outPort, 'out', srcIp, dstIp, proto, srcPort, dstPort);
    if (outRule && outRule.action === 'deny') {
      hits.push({ deviceId: currentId, ruleId: outRule.id });
      return { blocked: true, message: `ACL deny (${outRule.name || outRule.id}) on out ${outPort}`, hits };
    }
    const inRule = findRuleMatch(dstDev?.aclRules, inPort, 'in', srcIp, dstIp, proto, srcPort, dstPort);
    if (inRule && inRule.action === 'deny') {
      hits.push({ deviceId: nextId, ruleId: inRule.id });
      return { blocked: true, message: `ACL deny (${inRule.name || inRule.id}) on in ${inPort}`, hits };
    }
    currentId = nextId;
  }
  return { blocked: false, message: '', hits };
};

/**
 * Increment ACL hit counters for matched rules
 */
export const bumpAclHits = (devices: NetworkDevice[], hits: AclHit[]): NetworkDevice[] => {
  if (!hits.length) return devices;
  return devices.map(dev => {
    const relevant = hits.filter(hit => hit.deviceId === dev.id);
    if (!relevant.length) return dev;
    const nextRules = (dev.aclRules || []).map(rule => {
      const occurrences = relevant.filter(hit => hit.ruleId === rule.id).length;
      if (!occurrences) return rule;
      return { ...rule, hits: (rule.hits || 0) + occurrences };
    });
    return { ...dev, aclRules: nextRules };
  });
};

// ============================================================
// QoS Functions
// ============================================================

/**
 * Find QoS queue for a port based on DSCP value
 */
export const findQosQueue = (port: NetworkPort, dscp?: number) => {
  const queues = port.config.qos?.queues || [];
  if (!queues.length) return undefined;
  if (dscp !== undefined) {
    const match = queues.find(q => q.dscp === dscp);
    if (match) return match;
  }
  return queues[0];
};

/**
 * Trace QoS configuration along a path
 */
export const traceQosPath = (
  path: string[],
  devices: NetworkDevice[],
  cables: NetworkCable[],
  sourceId: string,
  dscp?: number
): QosTraceEntry[] => {
  const entries: QosTraceEntry[] = [];
  let currentId = sourceId;
  path.forEach(cableId => {
    const cable = cables.find(c => c.id === cableId);
    if (!cable) return;
    const isOutgoing = cable.sourceDeviceId === currentId;
    const device = devices.find(d => d.id === currentId);
    const portId = isOutgoing ? cable.sourcePortId : cable.targetPortId;
    const port = device?.ports.find(p => p.id === portId);
    if (port) {
      const qos = port.config.qos;
      const queue = findQosQueue(port, dscp);
      entries.push({
        portName: port.name,
        deviceName: device?.hostname || device?.id || 'unknown',
        deviceId: device?.id,
        portId: port.id,
        limit: qos?.limitMbps,
        shape: qos?.shapePct,
        queueName: queue?.name,
        queueWeight: queue?.weight,
        queueDscp: queue?.dscp
      });
    }
    currentId = isOutgoing ? cable.targetDeviceId : cable.sourceDeviceId;
  });
  return entries;
};

/**
 * Apply policing limit for a port and record usage windows
 */
export const applyQosLimit = (
  port: NetworkPort,
  packetBytes: number,
  now: number
): { blocked: boolean; reason?: string } => {
  const limit = port.config.qos?.limitMbps;
  if (!limit || limit <= 0) return { blocked: false };
  const usage = port.config.qosUsage ? { ...port.config.qosUsage } : { windowStart: now, bytes: 0 };
  if (now - usage.windowStart >= 1000) {
    usage.windowStart = now;
    usage.bytes = 0;
  }
  const limitBytes = Math.max(1, Math.round(limit * 125000));
  const projected = usage.bytes + packetBytes;
  if (projected > limitBytes) {
    usage.bytes = limitBytes;
    port.config.qosUsage = usage;
    return { blocked: true, reason: `QoS policing ${limit}Mbps on ${port.name}` };
  }
  usage.bytes = projected;
  port.config.qosUsage = usage;
  return { blocked: false };
};

/**
 * Summarize QoS trace entries into a human-readable string
 */
export const summarizeQosTrace = (entries: QosTraceEntry[]): string | null => {
  const notes = entries
    .filter(entry => entry.limit || entry.shape || entry.queueName)
    .map(entry => {
      const parts: string[] = [];
      if (entry.limit) parts.push(`limit ${entry.limit} Mbps`);
      if (entry.shape) parts.push(`shape ${entry.shape}%`);
      if (entry.queueName) {
        const weightStr = entry.queueWeight ? ` weight ${entry.queueWeight}` : '';
        const dscpStr = entry.queueDscp !== undefined ? ` dscp ${entry.queueDscp}` : '';
        parts.push(`queue ${entry.queueName}${weightStr}${dscpStr}`);
      }
      const detail = parts.join(', ');
      return detail ? `QoS ${entry.portName} (${entry.deviceName}): ${detail}` : '';
    })
    .filter(Boolean);
  return notes.length ? notes.join(' | ') : null;
};

/**
 * Compute estimated delay from QoS configuration
 */
export const computeQosDelay = (entries: QosTraceEntry[]): number => {
  return entries.reduce((acc, entry) => {
    const weightPenalty = entry.queueWeight ? Math.max(0, 5 - entry.queueWeight) * 2 : 0;
    const limitPenalty = entry.limit ? Math.max(0, 50 - entry.limit) / 5 : 0;
    const shapePenalty = entry.shape ? Math.max(0, 50 - entry.shape) / 10 : 0;
    return acc + weightPenalty + limitPenalty + shapePenalty;
  }, 0);
};

/**
 * Record QoS usage events
 */
export const recordQosUsage = (
  entries: QosTraceEntry[],
  events: { deviceId: string; entry: QosHistoryEntry }[]
): void => {
  const now = Date.now();
  entries.forEach(entry => {
    if (!entry.deviceId) return;
    const noteParts: string[] = [];
    if (entry.limit) noteParts.push(`limit ${entry.limit}Mbps`);
    if (entry.shape) noteParts.push(`shape ${entry.shape}%`);
    if (entry.queueName) {
      const queueParts: string[] = [`queue ${entry.queueName}`];
      if (entry.queueDscp !== undefined) queueParts.push(`dscp ${entry.queueDscp}`);
      if (entry.queueWeight !== undefined) queueParts.push(`w${entry.queueWeight}`);
      noteParts.push(queueParts.join(' '));
    }
    if (!noteParts.length) return;
    events.push({
      deviceId: entry.deviceId,
      entry: {
        id: generateUUID(),
        timestamp: now,
        portName: entry.portName,
        note: noteParts.join(', '),
        limit: entry.limit,
        shape: entry.shape,
        queueName: entry.queueName,
        queueDscp: entry.queueDscp,
        queueWeight: entry.queueWeight
      }
    });
  });
};

// ============================================================
// NAT Functions
// ============================================================

/**
 * Describe a NAT translation for output
 */
export const describeNatTranslation = (rule: NatRule | undefined, srcIp: string): string | null => {
  if (!rule) return null;
  const base = `NAT ${rule.type} -> ${rule.publicIp} (${srcIp})`;
  if (rule.privateIp) return `${base} for ${rule.privateIp}`;
  if (rule.pat && rule.publicPort) return `${base} PAT port ${rule.publicPort}`;
  return base;
};

/**
 * Build a NAT session from a rule and source IP
 */
export const buildNatSession = (rule: NatRule, srcIp: string): NatSession => {
  const now = Date.now();
  const session: NatSession = {
    id: generateUUID(),
    ruleId: rule.id,
    type: rule.type,
    privateIp: srcIp,
    privatePort: rule.privatePort,
    publicIp: rule.publicIp,
    publicPort: rule.publicPort ?? (rule.pat ? 50000 : undefined),
    protocol: rule.protocol ?? 'any',
    createdAt: now,
    lastUsed: now
  };
  return session;
};

/**
 * Find NAT rule for outgoing traffic
 */
export const getNatRuleForOut = (router: NetworkDevice | undefined, srcIp: string): NatRule | null => {
  if (!router?.natRules?.length) return null;
  return router.natRules.find(rule => {
    if (rule.type === 'static' && rule.privateIp) {
      return rule.privateIp === srcIp;
    }
    return rule.type === 'dynamic';
  }) ?? null;
};

/**
 * Analyze NAT along a path
 */
export const analyzeNatPath = (
  path: string[],
  devices: NetworkDevice[],
  cables: NetworkCable[],
  sourceId: string,
  srcIp: string,
  recordSession?: (routerId: string, session: NatSession) => void
): { routerId: string; ruleId: string; message: string | null } | null => {
  let current = sourceId;
  for (const cableId of path) {
    const cable = cables.find(c => c.id === cableId);
    if (!cable) break;
    const router = devices.find(d => d.id === current && d.natRules?.length);
    if (router) {
      const nat = getNatRuleForOut(router, srcIp);
      if (nat) {
        if (recordSession) {
          recordSession(router.id, buildNatSession(nat, srcIp));
        }
        return { routerId: router.id, ruleId: nat.id, message: describeNatTranslation(nat, srcIp) };
      }
    }
    current = cable.sourceDeviceId === current ? cable.targetDeviceId : cable.sourceDeviceId;
  }
  return null;
};
