/**
 * Route Command - Display routing table (PC)
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class RouteCommand extends Command {
  readonly name = 'route';
  readonly description = 'Display kernel routing table';
  readonly vendor = null; // Available on all PC devices

  canHandle(context: CommandContext): boolean {
    const isPc = context.device.vendor === 'PC' || context.device.model === 'PC';
    const cmd = context.normalizedCommand.toLowerCase();
    return isPc && cmd === 'route' && context.args[1] === '-n';
  }

  validate(_context: CommandContext): { valid: boolean; error?: string } {
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, utils } = context;
    const output: string[] = [];

    const nic = device.ports[0];
    if (!nic) {
      return this.createError('No network interface found');
    }

    // Display routing table
    output.push('Kernel IP routing table');
    output.push('Destination     Gateway         Genmask        Iface');

    // Default route
    const gateway = device.defaultGateway ?? '0.0.0.0';
    output.push(`0.0.0.0         ${gateway.padEnd(15)} 0.0.0.0        ${nic.name}`);

    // Connected network route
    const ipAddr = nic.config.ipAddress || '0.0.0.0';
    const mask = nic.config.subnetMask || 24;
    const network = utils.getNetworkAddress(ipAddr, mask);

    output.push(`${network.padEnd(15)} 0.0.0.0         255.255.255.0  ${nic.name}`);

    return this.createOutput(output, device);
  }
}
