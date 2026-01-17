/**
 * DHCP Enable Command - Enable DHCP on device
 * Handles: dhcp enable
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class DhcpEnableCommand extends Command {
  readonly name = 'dhcp enable';
  readonly description = 'Enable DHCP on device';
  readonly requiredView = ['system-view'];

  canHandle(context: CommandContext): boolean {
    return context.normalizedCommand.toLowerCase() === 'dhcp enable';
  }

  execute(context: CommandContext): CommandResult {
    const { device } = context;
    const output: string[] = [];

    device.dhcpEnabled = true;
    device.dhcpPools = device.dhcpPools || [];
    output.push('Info: DHCP Enabled.');

    return this.createOutput(output, device);
  }
}
