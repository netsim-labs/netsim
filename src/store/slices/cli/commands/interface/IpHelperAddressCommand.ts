/**
 * IP Helper Address Command - Configure DHCP relay helper address
 * Handles: ip helper-address <ip>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class IpHelperAddressCommand extends Command {
  readonly name = 'ip helper-address';
  readonly description = 'Configure DHCP relay helper address';
  readonly requiredView = ['interface-view'];

  canHandle(context: CommandContext): boolean {
    const { args } = context;
    return args[0]?.toLowerCase() === 'ip' && args[1]?.toLowerCase() === 'helper-address';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    if (!context.args[2]) {
      return { valid: false, error: 'Error: ip helper-address <ip>' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];
    const ifaceId = device.cliState.currentInterfaceId;
    const helperIp = args[2];

    if (!ifaceId) {
      return this.createError('Interface not selected.');
    }

    // Only applies to regular ports
    if (ifaceId.startsWith('vlanif') || ifaceId.startsWith('eth-trunk')) {
      return this.createError('Command not applicable to this interface type.');
    }

    const pIdx = device.ports.findIndex(p => p.id === ifaceId);
    if (pIdx === -1) {
      return this.createError('Interface not selected.');
    }

    // Initialize helper addresses array if needed
    const helpers = device.ports[pIdx].config.helperAddresses || [];
    if (!helpers.includes(helperIp)) {
      helpers.push(helperIp);
    }
    device.ports[pIdx].config.helperAddresses = helpers;

    output.push(`Info: helper-address ${helperIp} added.`);
    return this.createOutput(output, device);
  }
}
