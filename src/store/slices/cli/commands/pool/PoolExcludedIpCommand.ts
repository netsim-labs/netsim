/**
 * Pool Excluded IP Command - Exclude IP from DHCP pool
 * Handles: excluded-ip <ip>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class PoolExcludedIpCommand extends Command {
  readonly name = 'excluded-ip';
  readonly description = 'Exclude IP from DHCP pool';
  readonly requiredView = ['pool-view'];

  canHandle(context: CommandContext): boolean {
    return context.args[0]?.toLowerCase() === 'excluded-ip';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    if (!context.args[1]) {
      return { valid: false, error: 'Error: excluded-ip <ip>' };
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

    device.dhcpPools[pIdx].excluded = device.dhcpPools[pIdx].excluded || [];
    device.dhcpPools[pIdx].excluded!.push(args[1]);
    output.push('Info: IP excluida.');

    return this.createOutput(output, device);
  }
}
