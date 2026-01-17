/**
 * Pool Static Bind Command - Create static MAC-IP binding
 * Handles: static-bind <mac> <ip>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class PoolStaticBindCommand extends Command {
  readonly name = 'static-bind';
  readonly description = 'Create static MAC-IP binding in DHCP pool';
  readonly requiredView = ['pool-view'];

  canHandle(context: CommandContext): boolean {
    return context.args[0]?.toLowerCase() === 'static-bind';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    if (!context.args[1] || !context.args[2]) {
      return { valid: false, error: 'Error: static-bind <mac> <ip>' };
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

    device.dhcpPools[pIdx].staticBindings = device.dhcpPools[pIdx].staticBindings || [];
    device.dhcpPools[pIdx].staticBindings!.push({
      mac: args[1],
      ip: args[2]
    });
    output.push('Info: Static binding added.');

    return this.createOutput(output, device);
  }
}
