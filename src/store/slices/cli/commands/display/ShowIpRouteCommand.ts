/**
 * Show IP Route Command - Display routing table (Cisco)
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { formatCiscoIpRoute } from '../../formatters.js';

export class ShowIpRouteCommand extends Command {
  readonly name = 'show ip route';
  readonly description = 'Display IP routing table';
  readonly vendor = 'cisco';

  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd === 'show ip route';
  }

  validate(_context: CommandContext): { valid: boolean; error?: string } {
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const output = formatCiscoIpRoute(context.device);
    return this.createOutput(output, context.device);
  }
}
