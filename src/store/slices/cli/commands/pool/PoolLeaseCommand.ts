/**
 * Pool Lease Command - Configure lease time for DHCP pool
 * Handles: lease <seconds>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class PoolLeaseCommand extends Command {
  readonly name = 'lease';
  readonly description = 'Configure lease time for DHCP pool';
  readonly requiredView = ['pool-view'];

  canHandle(context: CommandContext): boolean {
    return context.args[0]?.toLowerCase() === 'lease';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    const seconds = Number.parseInt(context.args[1], 10);
    if (Number.isNaN(seconds) || seconds <= 0) {
      return { valid: false, error: 'Error: lease <segundos>' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];
    const poolName = device.cliState.currentPoolName;
    const seconds = Number.parseInt(args[1], 10);

    if (!poolName || !device.dhcpPools) {
      return this.createError('No pool selected.');
    }

    const pIdx = device.dhcpPools.findIndex(p => p.name === poolName);
    if (pIdx === -1) {
      return this.createError('Pool not found.');
    }

    device.dhcpPools[pIdx].leaseSeconds = seconds;
    output.push(`Info: Lease ${seconds}s.`);

    return this.createOutput(output, device);
  }
}
