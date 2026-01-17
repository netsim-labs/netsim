/**
 * Ifconfig Command - Display network interface configuration (PC)
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class IfconfigCommand extends Command {
  readonly name = 'ifconfig';
  readonly description = 'Display network interface configuration';
  readonly vendor = null; // Available on all PC devices

  canHandle(context: CommandContext): boolean {
    const isPc = context.device.vendor === 'PC' || context.device.model === 'PC';
    return isPc && context.normalizedCommand.toLowerCase() === 'ifconfig';
  }

  validate(_context: CommandContext): { valid: boolean; error?: string } {
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device } = context;
    const output: string[] = [];

    // Find the primary NIC (first port)
    const nic = device.ports[0];
    if (!nic) {
      return this.createError('No network interface found');
    }

    // Display interface configuration
    const ipAddr = nic.config.ipAddress ?? '0.0.0.0';
    const netmask = nic.config.subnetMask ? `/${nic.config.subnetMask}` : '/-';

    output.push(`eth0      inet ${ipAddr}  netmask ${netmask}`);
    output.push(`          ether ${device.macAddress}`);

    return this.createOutput(output, device);
  }
}
