/**
 * Display VLAN Command - Show VLAN information
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class DisplayVlanCommand extends Command {
  readonly name = 'display vlan';
  readonly description = 'Display VLAN information';
  readonly aliases = ['dis vlan'];
  readonly vendor = 'huawei';

  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd === 'display vlan' || cmd === 'dis vlan';
  }

  validate(_context: CommandContext): { valid: boolean; error?: string } {
    // No validation needed - just display info
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device } = context;
    const output: string[] = [];

    // Always include VLAN 1
    const vlans = device.vlans || [];
    const vlanSet = new Set(vlans);
    vlanSet.add(1);
    const uniqueVlans = Array.from(vlanSet).sort((a, b) => a - b);

    output.push(`Total VLANs: ${uniqueVlans.length}`);
    output.push(`Active: ${uniqueVlans.join(' ')}`);

    return this.createOutput(output, device);
  }
}
