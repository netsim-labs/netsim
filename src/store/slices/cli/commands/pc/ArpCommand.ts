/**
 * ARP Command - Display ARP table (PC)
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class ArpCommand extends Command {
  readonly name = 'arp';
  readonly description = 'Display ARP table';
  readonly vendor = null; // Available on all PC devices

  canHandle(context: CommandContext): boolean {
    const isPc = context.device.vendor === 'PC' || context.device.model === 'PC';
    return isPc && context.normalizedCommand.toLowerCase() === 'arp';
  }

  validate(_context: CommandContext): { valid: boolean; error?: string } {
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, cables, devices } = context;
    const output: string[] = [];

    // Find connected cable
    const cable = cables.find(
      (c) => c.sourceDeviceId === device.id || c.targetDeviceId === device.id
    );

    if (!cable) {
      return this.createOutput(['ARP table is empty (no link).'], device);
    }

    // Find peer device
    const peerId = cable.sourceDeviceId === device.id ? cable.targetDeviceId : cable.sourceDeviceId;
    const peer = devices.find((d) => d.id === peerId);

    if (!peer) {
      return this.createOutput(['ARP table is empty.'], device);
    }

    // Find peer's IP address
    const peerIp = peer.ports.find((p) => p.config.ipAddress)?.config.ipAddress || '0.0.0.0';

    // Display ARP table
    const nic = device.ports[0];
    output.push('Address          HWtype  HWaddress        Iface');
    output.push(`${peerIp.padEnd(16)} ether   ${peer.macAddress}   ${nic?.name || 'eth0'}`);

    return this.createOutput(output, device);
  }
}
