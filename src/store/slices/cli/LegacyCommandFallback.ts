/**
 * Legacy Command Fallback
 *
 * This module provides a wrapper that tries the new Command Pattern first,
 * and falls back to the legacy implementation for commands not yet migrated.
 *
 * This allows gradual migration without breaking existing functionality.
 */

import { NetworkDevice, NetworkCable } from '../../../types/NetworkTypes';
import { executeCliCommand } from './CommandExecutor';
import { globalCommandRegistry } from './commands';
import { getVendorProfile } from '../../../utils/cliProfiles';
import { normalizeCommand } from './formatters';

/**
 * Check if a command has been migrated to the new Command Pattern
 */
export function isCommandMigrated(
  cmdInput: string,
  device: NetworkDevice,
  devices: NetworkDevice[],
  cables: NetworkCable[],
  cloneDevice: (id: string) => NetworkDevice | undefined,
  highlightTraffic: (path: string[], trace: any) => void
): boolean {
  const profile = getVendorProfile(device.vendor, device.model);
  const normalizedCmd = normalizeCommand(cmdInput.trim().split('|')[0].trim(), profile).trim();
  const args = normalizedCmd.split(/\s+/).filter(Boolean);

  const context = {
    device,
    devices,
    cables,
    profile,
    rawInput: cmdInput.trim(),
    normalizedCommand: normalizedCmd,
    args,
    cloneDevice,
    highlightTraffic,
    utils: {} as any // Not needed for just checking
  };

  // Check if we have a command that can handle this
  const command = globalCommandRegistry.findCommand(context);
  return command !== null;
}

/**
 * Execute command with new pattern or fallback to legacy
 */
export async function executeWithFallback(
  cmdInput: string,
  device: NetworkDevice,
  devices: NetworkDevice[],
  cables: NetworkCable[],
  cloneDevice: (id: string) => NetworkDevice | undefined,
  highlightTraffic: (path: string[], trace: any) => void,
  legacyExecute: () => any
): Promise<{
  usedNewPattern: boolean;
  result: any;
}> {
  // Try new command pattern first
  if (isCommandMigrated(cmdInput, device, devices, cables, cloneDevice, highlightTraffic)) {
    const result = await executeCliCommand(
      cmdInput,
      device,
      devices,
      cables,
      cloneDevice,
      highlightTraffic
    );

    return {
      usedNewPattern: true,
      result
    };
  }

  // Fallback to legacy implementation
  return {
    usedNewPattern: false,
    result: legacyExecute()
  };
}
