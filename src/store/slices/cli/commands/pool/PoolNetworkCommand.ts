/**
 * Pool Network Command - Configure network for DHCP pool
 * Handles: network <ip> mask <mask>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class PoolNetworkCommand extends Command {
  readonly name = 'network';
  readonly description = 'Configure network for DHCP pool';
  readonly requiredView = ['pool-view'];

  canHandle(context: CommandContext): boolean {
    return context.args[0]?.toLowerCase() === 'network';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    const { args } = context;
    if (!args[1] || args[2]?.toLowerCase() !== 'mask' || !args[3]) {
      return { valid: false, error: 'Error: network <ip> mask <mask>' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];
    const poolName = device.cliState.currentPoolName;

    if (!poolName || !device.dhcpPools) {
      return this.createError('No pool selected.');
    }

    const pIdx = device.dhcpPools.findIndex(p => p.name === poolName);
    if (pIdx === -1) {
      return this.createError('Pool not found.');
    }

    device.dhcpPools[pIdx].network = args[1];
    device.dhcpPools[pIdx].mask = Number.parseInt(args[3], 10) || 24;
    output.push('Info: Pool network set.');

    return this.createOutput(output, device);
  }
}
