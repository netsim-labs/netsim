/**
 * Show Version Command - Display Cisco IOS version (Cisco)
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { formatCiscoVersion } from '../../formatters.js';

export class ShowVersionCommand extends Command {
  readonly name = 'show version';
  readonly description = 'Display Cisco IOS version information';
  readonly vendor = 'cisco';

  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd === 'show version';
  }

  validate(_context: CommandContext): { valid: boolean; error?: string } {
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const output = formatCiscoVersion();
    return this.createOutput(output, context.device);
  }
}
