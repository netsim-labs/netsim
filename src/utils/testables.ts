export type DeviceModel =
  | 'NS-Switch-L3-24'
  | 'NS-Switch-L3-48'
  | 'NS-Switch-L3-24SFP'
  | 'NS-Switch-L3-24-POE'
  | 'NS-Router-IM8'
  | 'NS-Router-4G'
  | 'PC'
  | 'AP-POE'
  | 'PHONE-VOIP';

export const nextDhcpIp = (
  network: string,
  _mask: number,
  used: string[],
  gateway: string,
  excluded: string[] = []
): string | null => {
  const octets = network.split('.').map(Number);
  if (octets.length !== 4 || Number.isNaN(octets[3])) return null;
  const prefix = `${octets[0]}.${octets[1]}.${octets[2]}`;
  for (let i = 2; i < 254; i++) {
    const candidate = `${prefix}.${i}`;
    if (candidate === gateway) continue;
    if (excluded.includes(candidate)) continue;
    if (!used.includes(candidate)) return candidate;
  }
  return null;
};

export interface VrrpCandidate {
  deviceId: string;
  priority: number;
  routerId: string;
}

export const vrrpSelectMaster = (candidates: VrrpCandidate[]): string | null => {
  if (!candidates.length) return null;
  const sorted = [...candidates].sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    return a.routerId.localeCompare(b.routerId);
  });
  return sorted[0].deviceId;
};

export const poePowerOk = (device: DeviceModel, peer: DeviceModel): boolean => {
  const needsPoE = device === 'AP-POE' || device === 'PHONE-VOIP';
  const peerPoE = peer === 'NS-Switch-L3-24-POE';
  return !needsPoE || peerPoE;
};
