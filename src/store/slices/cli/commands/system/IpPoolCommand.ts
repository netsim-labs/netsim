/**
 * IP Pool Command - Create/enter DHCP pool configuration
 * Handles: ip pool <name>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class IpPoolCommand extends Command {
  readonly name = 'ip pool';
  readonly description = 'Create or enter DHCP pool configuration';
  readonly requiredView = ['system-view'];

  canHandle(context: CommandContext): boolean {
    const { args } = context;
    return args[0]?.toLowerCase() === 'ip' && args[1]?.toLowerCase() === 'pool';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    if (!context.args[2]) {
      return { valid: false, error: 'Error: ip pool <name>' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args, utils } = context;
    const output: string[] = [];
    const poolName = args[2];

    device.dhcpPools = device.dhcpPools || [];

    // Create pool if it doesn't exist
    const existing = device.dhcpPools.find(p => p.name === poolName);
    if (!existing) {
      device.dhcpPools.push({
        id: utils.generateUUID(),
        name: poolName,
        network: '',
        mask: 0,
        gateway: '',
        dns: '',
        usedIps: [],
        excluded: [],
        staticBindings: [],
        leaseSeconds: 86400,
        leases: []
      });
    }

    // Enter pool-view
    device.cliState.view = 'pool-view';
    device.cliState.currentPoolName = poolName;
    output.push(`Info: Enter IP pool view (${poolName})`);

    return this.createOutput(output, device);
  }
}
