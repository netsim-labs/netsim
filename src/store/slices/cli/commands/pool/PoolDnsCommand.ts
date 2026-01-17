/**
 * Pool DNS Command - Configure DNS for DHCP pool
 * Handles: dns-list <ip>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class PoolDnsCommand extends Command {
  readonly name = 'dns-list';
  readonly description = 'Configure DNS for DHCP pool';
  readonly requiredView = ['pool-view'];

  canHandle(context: CommandContext): boolean {
    return context.args[0]?.toLowerCase() === 'dns-list';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    if (!context.args[1]) {
      return { valid: false, error: 'Error: dns-list <ip>' };
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

    device.dhcpPools[pIdx].dns = args[1];
    output.push('Info: DNS set.');

    return this.createOutput(output, device);
  }
}
