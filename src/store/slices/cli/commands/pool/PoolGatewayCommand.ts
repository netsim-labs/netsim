/**
 * Pool Gateway Command - Configure gateway for DHCP pool
 * Handles: gateway-list <ip>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class PoolGatewayCommand extends Command {
  readonly name = 'gateway-list';
  readonly description = 'Configure gateway for DHCP pool';
  readonly requiredView = ['pool-view'];

  canHandle(context: CommandContext): boolean {
    return context.args[0]?.toLowerCase() === 'gateway-list';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    if (!context.args[1]) {
      return { valid: false, error: 'Error: gateway-list <ip>' };
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

    device.dhcpPools[pIdx].gateway = args[1];
    // Add gateway to used IPs
    device.dhcpPools[pIdx].usedIps = Array.from(
      new Set([...(device.dhcpPools[pIdx].usedIps || []), args[1]])
    );
    output.push('Info: Gateway set.');

    return this.createOutput(output, device);
  }
}
