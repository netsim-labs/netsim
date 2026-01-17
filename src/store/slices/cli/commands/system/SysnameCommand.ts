/**
 * Sysname Command - Set device hostname
 * Handles: sysname <name>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class SysnameCommand extends Command {
  readonly name = 'sysname';
  readonly description = 'Set device hostname';
  readonly requiredView = ['system-view'];

  canHandle(context: CommandContext): boolean {
    return context.args[0]?.toLowerCase() === 'sysname';
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];

    if (args[1]) {
      device.hostname = args[1];
    }

    return this.createOutput(output, device);
  }
}
