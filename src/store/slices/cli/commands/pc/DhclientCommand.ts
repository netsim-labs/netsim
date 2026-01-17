/**
 * Dhclient Command - Request DHCP lease (PC)
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class DhclientCommand extends Command {
  readonly name = 'dhclient';
  readonly description = 'Request IP address from DHCP server';
  readonly vendor = null; // Available on all PC devices

  canHandle(context: CommandContext): boolean {
    const isPc = context.device.vendor === 'PC' || context.device.model === 'PC';
    const cmd = context.normalizedCommand.toLowerCase();
    return isPc && (cmd === 'dhclient' || cmd === 'ip dhcp');
  }

  validate(_context: CommandContext): { valid: boolean; error?: string } {
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, cables, devices, utils } = context;
    const output: string[] = [];

    // Find connected cable
    const cable = cables.find(
      (c) => c.sourceDeviceId === device.id || c.targetDeviceId === device.id
    );

    if (!cable) {
      return this.createError('Error: No link.');
    }

    // Find the DHCP server
    const serverId = cable.sourceDeviceId === device.id ? cable.targetDeviceId : cable.sourceDeviceId;
    const server = devices.find((d) => d.id === serverId);

    if (!server?.dhcpEnabled || !server.dhcpPools || server.dhcpPools.length === 0) {
      return this.createError('Error: No DHCP server.');
    }

    // Get IP from DHCP pool
    const pool = server.dhcpPools[0];
    const nextIp = utils.getNextIp(pool.network, pool.mask, pool.usedIps || [], pool.gateway);

    if (!nextIp) {
      return this.createError('Error: DHCP pool exhausted.');
    }

    // Update device configuration
    const updatedDevice = { ...device };
    const nic = updatedDevice.ports[0];
    if (nic) {
      nic.config = {
        ...nic.config,
        ipAddress: nextIp,
        subnetMask: pool.mask,
      };
    }

    // Update DHCP pool
    const updatedServer = { ...server };
    if (updatedServer.dhcpPools && updatedServer.dhcpPools[0]) {
      updatedServer.dhcpPools[0].usedIps = [...(pool.usedIps || []), nextIp];
    }

    // Create device updates map
    const deviceUpdates = new Map<string, typeof device>();
    deviceUpdates.set(server.id, updatedServer);

    output.push(`DHCP ACK: ${nextIp}/${pool.mask} gw ${pool.gateway}`);

    return {
      output,
      device: updatedDevice,
      deviceUpdates,
    };
  }
}
