/**
 * Show VLAN Brief Command - Display VLANs in Cisco format
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { formatCiscoVlanBrief } from '../../formatters.js';

export class ShowVlanBriefCommand extends Command {
  readonly name = 'show vlan brief';
  readonly description = 'Display VLAN information in brief format';
  readonly aliases = ['show vlan'];
  readonly vendor = 'cisco';

  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd === 'show vlan brief' || cmd === 'show vlan';
  }

  validate(_context: CommandContext): { valid: boolean; error?: string } {
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const output = formatCiscoVlanBrief(context.device);
    return this.createOutput(output, context.device);
  }
}
