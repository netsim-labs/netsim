/**
 * Show IP Interface Brief Command - Display interface IP info (Cisco)
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { formatCiscoIpInterfaceBrief } from '../../formatters.js';

export class ShowIpInterfaceBriefCommand extends Command {
  readonly name = 'show ip interface brief';
  readonly description = 'Display interface IP address and status';
  readonly aliases = ['show ip int br', 'show ip int brief'];
  readonly vendor = 'cisco';

  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();
    return (
      cmd === 'show ip interface brief' ||
      cmd === 'show ip int brief' ||
      cmd === 'show ip int br'
    );
  }

  validate(_context: CommandContext): { valid: boolean; error?: string } {
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const output = formatCiscoIpInterfaceBrief(context.device);
    return this.createOutput(output, context.device);
  }
}
