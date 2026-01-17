/**
 * Show Running-Config Command - Display running configuration (Cisco)
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { formatCiscoRunningConfig } from '../../formatters.js';

export class ShowRunningConfigCommand extends Command {
  readonly name = 'show running-config';
  readonly description = 'Display current running configuration';
  readonly aliases = ['show run'];
  readonly vendor = 'cisco';

  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd === 'show running-config' || cmd === 'show run';
  }

  validate(_context: CommandContext): { valid: boolean; error?: string } {
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const output = formatCiscoRunningConfig(context.device);
    return this.createOutput(output, context.device);
  }
}
