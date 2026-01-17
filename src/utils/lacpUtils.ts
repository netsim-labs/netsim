/**
 * LACP (Link Aggregation Control Protocol) Utilities
 * Implements IEEE 802.3ad LACP negotiation logic
 */

import { NetworkDevice, EthTrunk, LacpPartnerInfo, LacpActorInfo, LacpPortState, LacpActorState, LacpState, LacpMode } from '../types/NetworkTypes.js';

export const LACP_CONSTANTS = {
  SLOW_PERIODIC_TIME: 30, // seconds
  FAST_PERIODIC_TIME: 1,  // second
  SHORT_TIMEOUT_TIME: 3,  // seconds
  LONG_TIMEOUT_TIME: 90,  // seconds
  CHURN_DETECTION_TIME: 60, // seconds
  AGGREGATE_WAIT_TIME: 2,  // seconds
};

export interface LacpPdu {
  subtype: number; // Always 1 for LACP
  version: number; // Always 1
  actor: LacpActorInfo;
  partner: LacpPartnerInfo;
  collectorMaxDelay: number;
  collectorInfo: number;
  terminator: number[]; // 50 bytes of 0
}

/**
 * Initialize LACP state for an Eth-Trunk
 */
export function initializeLacpState(trunk: EthTrunk, device: NetworkDevice): void {
  trunk.lacpKey = parseInt(trunk.id);
  trunk.systemPriority = 32768; // Default LACP system priority
  trunk.lacpEnabled = trunk.mode === 'active' || trunk.mode === 'passive';
  trunk.ports = {};

  // Initialize LACP state for each member port
  trunk.members.forEach((portId, index) => {
    const port = device.ports.find(p => p.id === portId);
    if (port) {
      trunk.ports![portId] = {
        actor: {
          systemId: device.macAddress || '00:00:00:00:00:00',
          systemPriority: trunk.systemPriority!,
          portId: index + 1,
          portPriority: 32768, // Default port priority
          key: trunk.lacpKey!,
          state: {
            activity: trunk.mode === 'active' ? 1 : 0,
            timeout: 1, // Short timeout by default
            aggregation: 1, // Aggregatable
            synchronization: 0, // Not in sync initially
            collecting: 0, // Not collecting
            distributing: 0, // Not distributing
            defaulted: 1, // Using default partner info
            expired: 0, // Not expired
          },
        },
        partner: {
          systemId: '00:00:00:00:00:00', // Default partner
          systemPriority: 32768,
          portId: 0,
          portPriority: 32768,
          key: 0,
          state: 0, // All flags off
        },
        state: 'down',
        selected: false,
        standby: false,
      };
    }
  });
}

/**
 * Process received LACP PDU and update trunk state
 */
export function processLacpPdu(
  trunk: EthTrunk,
  portId: string,
  receivedPdu: LacpPdu,
  currentTime: number
): boolean {
  const portState = trunk.ports?.[portId];
  if (!portState) return false;

  const oldPartner = { ...portState.partner };
  const oldState = portState.state;

  // Update partner information
  portState.partner = {
    systemId: receivedPdu.actor.systemId,
    systemPriority: receivedPdu.actor.systemPriority,
    portId: receivedPdu.actor.portId,
    portPriority: receivedPdu.actor.portPriority,
    key: receivedPdu.actor.key,
    state: encodeLacpState(receivedPdu.actor.state),
  };

  // Update last PDU timestamp
  trunk.lastLacpPdu = currentTime;

  // Determine if partner info changed
  const partnerChanged = !partnersEqual(oldPartner, portState.partner);

  // Update actor state based on partner
  updateActorState(portState, trunk.mode!);

  // Determine new port state
  const newState = determinePortState(portState);

  // Check if state changed
  const stateChanged = oldState !== newState || partnerChanged;

  if (stateChanged) {
    portState.state = newState;
    // Trigger selection logic
    updateTrunkSelection(trunk);
  }

  return stateChanged;
}

/**
 * Update actor state based on partner information
 */
function updateActorState(portState: LacpPortState, mode: LacpMode): void {
  const actor = portState.actor;

  // Activity bit
  actor.state.activity = mode === 'active' ? 1 : 0;

  // Synchronization: we're in sync if partner is in sync
  const partnerState = decodeLacpState(portState.partner.state);
  actor.state.synchronization = partnerState.synchronization;

  // Collecting: we can collect if we're in sync and partner is collecting
  actor.state.collecting = (actor.state.synchronization && partnerState.collecting) ? 1 : 0;

  // Distributing: we can distribute if we're collecting and partner is distributing
  actor.state.distributing = (actor.state.collecting && partnerState.distributing) ? 1 : 0;

  // Defaulted: we're not using default info if we have valid partner info
  actor.state.defaulted = portState.partner.systemId === '00:00:00:00:00:00' ? 1 : 0;

  // Expired: check timeout
  // (This would be set by a timeout mechanism)
}

/**
 * Determine the LACP state of a port
 */
function determinePortState(portState: LacpPortState): LacpState {
  const actor = portState.actor;
  const partner = decodeLacpState(portState.partner.state);

  // If not aggregatable, port is down
  if (actor.state.aggregation === 0 || partner.aggregation === 0) {
    return 'down';
  }

  // If expired, port is expired
  if (actor.state.expired === 1) {
    return 'expired';
  }

  // If defaulted, port is defaulted
  if (actor.state.defaulted === 1) {
    return 'defaulted';
  }

  // If distributing and collecting, port is bundled
  if (actor.state.distributing === 1 && actor.state.collecting === 1) {
    return 'bundled';
  }

  // If collecting but not distributing, port is collecting
  if (actor.state.collecting === 1) {
    return 'collecting';
  }

  // If distributing but not collecting, port is distributing
  if (actor.state.distributing === 1) {
    return 'distributing';
  }

  // If selected but not yet forwarding, port is standby
  if (portState.selected && !portState.standby) {
    return 'standby';
  }

  return 'down';
}

/**
 * Update trunk port selection based on LACP states
 */
function updateTrunkSelection(trunk: EthTrunk): void {
  if (!trunk.ports) return;

  const ports = Object.values(trunk.ports);

  // Count bundled ports
  const bundledPorts = ports.filter(p => p.state === 'bundled');

  // If we have bundled ports, select them
  if (bundledPorts.length > 0) {
    ports.forEach(port => {
      port.selected = port.state === 'bundled';
      port.standby = false;
    });
  } else {
    // No bundled ports, check for collecting/distributing
    const activePorts = ports.filter(p =>
      p.state === 'collecting' || p.state === 'distributing'
    );

    if (activePorts.length > 0) {
      // Select first active port, put others in standby
      activePorts.forEach((port, index) => {
        port.selected = index === 0;
        port.standby = index > 0;
      });

      // Mark non-active ports as not selected
      ports.filter(p => !activePorts.includes(p)).forEach(port => {
        port.selected = false;
        port.standby = false;
      });
    } else {
      // No active ports
      ports.forEach(port => {
        port.selected = false;
        port.standby = false;
      });
    }
  }

  // Update trunk overall state
  updateTrunkState(trunk);
}

/**
 * Update overall trunk state
 */
function updateTrunkState(trunk: EthTrunk): void {
  if (!trunk.ports) {
    trunk.actorState = 'down';
    trunk.partnerState = 'down';
    return;
  }

  const ports = Object.values(trunk.ports);
  const selectedPorts = ports.filter(p => p.selected);
  const standbyPorts = ports.filter(p => p.standby);

  if (selectedPorts.length > 0) {
    trunk.actorState = 'bundled';
  } else if (standbyPorts.length > 0) {
    trunk.actorState = 'standby';
  } else {
    trunk.actorState = 'down';
  }

  // Partner state is based on whether we have any valid partners
  const hasValidPartner = ports.some(p => p.partner.systemId !== '00:00:00:00:00:00');
  trunk.partnerState = hasValidPartner ? trunk.actorState : 'down';
}

/**
 * Check for LACP timeouts and update expired states
 */
export function checkLacpTimeouts(trunk: EthTrunk, currentTime: number): boolean {
  if (!trunk.ports || !trunk.lastLacpPdu) return false;

  let changed = false;
  const timeoutThreshold = trunk.ports[Object.keys(trunk.ports)[0]]?.actor.state.timeout === 1
    ? LACP_CONSTANTS.SHORT_TIMEOUT_TIME
    : LACP_CONSTANTS.LONG_TIMEOUT_TIME;

  const expiredTime = currentTime - (timeoutThreshold * 1000);

  if (trunk.lastLacpPdu < expiredTime) {
    // Mark all ports as expired
    Object.values(trunk.ports).forEach(port => {
      if (port.actor.state.expired === 0) {
        port.actor.state.expired = 1;
        port.state = 'expired';
        changed = true;
      }
    });

    if (changed) {
      updateTrunkSelection(trunk);
    }
  }

  return changed;
}

/**
 * Generate LACP PDU for transmission
 */
export function generateLacpPdu(trunk: EthTrunk, portId: string): LacpPdu | null {
  const portState = trunk.ports?.[portId];
  if (!portState) return null;

  return {
    subtype: 1, // LACP
    version: 1,
    actor: portState.actor,
    partner: portState.partner,
    collectorMaxDelay: 0,
    collectorInfo: 0,
    terminator: new Array(50).fill(0),
  };
}

/**
 * Compare two partner info objects for equality
 */
function partnersEqual(a: LacpPartnerInfo, b: LacpPartnerInfo): boolean {
  return (
    a.systemId === b.systemId &&
    a.systemPriority === b.systemPriority &&
    a.portId === b.portId &&
    a.portPriority === b.portPriority &&
    a.key === b.key &&
    a.state === b.state
  );
}

/**
 * Encode LACP state object to bit field
 */
function encodeLacpState(state: LacpActorState): number {
  return (
    (state.activity << 0) |
    (state.timeout << 1) |
    (state.aggregation << 2) |
    (state.synchronization << 3) |
    (state.collecting << 4) |
    (state.distributing << 5) |
    (state.defaulted << 6) |
    (state.expired << 7)
  );
}

/**
 * Decode LACP state bit field to object
 */
function decodeLacpState(stateBits: number): LacpActorState {
  return {
    activity: (stateBits & (1 << 0)) ? 1 : 0,
    timeout: (stateBits & (1 << 1)) ? 1 : 0,
    aggregation: (stateBits & (1 << 2)) ? 1 : 0,
    synchronization: (stateBits & (1 << 3)) ? 1 : 0,
    collecting: (stateBits & (1 << 4)) ? 1 : 0,
    distributing: (stateBits & (1 << 5)) ? 1 : 0,
    defaulted: (stateBits & (1 << 6)) ? 1 : 0,
    expired: (stateBits & (1 << 7)) ? 1 : 0,
  };
}

/**
 * Get LACP status summary for display
 */
export function getLacpStatus(trunk: EthTrunk): string {
  if (!trunk.lacpEnabled) {
    return 'LACP disabled';
  }

  const ports = trunk.ports ? Object.values(trunk.ports) : [];
  const bundled = ports.filter(p => p.state === 'bundled').length;
  const standby = ports.filter(p => p.standby).length;
  const total = ports.length;

  return `LACP ${trunk.mode}: ${bundled}/${total} bundled, ${standby} standby`;
}
