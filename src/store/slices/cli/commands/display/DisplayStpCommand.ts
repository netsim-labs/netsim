/**
 * Display STP Command - Show Spanning Tree Protocol information
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { formatStpFlags, formatStpCounters } from '../../formatters.js';

export class DisplayStpCommand extends Command {
  readonly name = 'display stp';
  readonly description = 'Display STP information';
  readonly aliases = ['dis stp'];
  readonly vendor = 'huawei';

  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd === 'display stp' || cmd === 'dis stp';
  }

  validate(_context: CommandContext): { valid: boolean; error?: string } {
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device } = context;
    const output: string[] = [];

    // Display STP information for all ports
    output.push('Port                 Role  Status    Flags                     Counters');

    device.ports.forEach(p => {
      const role = p.stpRole.padEnd(5);
      const status = p.stpStatus.padEnd(8);
      const flags = formatStpFlags(p).padEnd(24);
      const counters = formatStpCounters(p);

      output.push(`${p.name.padEnd(20)} ${role} ${status} ${flags} ${counters}`);
    });

    return this.createOutput(output, device);
  }
}
