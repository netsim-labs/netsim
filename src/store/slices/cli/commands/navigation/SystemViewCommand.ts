/**
 * System View Commands - CLI view navigation
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

/**
 * Enter system-view
 */
export class SystemViewCommand extends Command {
  readonly name = 'system-view';
  readonly description = 'Enter system view';
  readonly aliases = ['sys'];

  canHandle(context: CommandContext): boolean {
    const cmd = context.args[0]?.toLowerCase();
    return cmd === 'sys' || cmd === 'system-view' || context.normalizedCommand === 'system-view';
  }

  execute(context: CommandContext): CommandResult {
    const { device, profile } = context;
    const output: string[] = [];

    // Cisco uses "configure terminal"
    const isCisco = profile.id === 'cisco';
    const isCiscoConfigTerminal = isCisco && (
      context.rawInput.toLowerCase() === 'configure terminal' ||
      context.rawInput.toLowerCase() === 'conf t'
    );

    if (!isCisco) {
      output.push('Enter system view, return user view with return command.');
      output.push('Entering system-view (simulated).');
      output.push('Type `return` to go back.');
    } else if (isCiscoConfigTerminal) {
      output.push('Enter configuration commands, one per line. End with CNTL/Z.');
    }

    device.cliState.view = 'system-view';

    return this.createOutput(output, device);
  }
}

/**
 * Return to user view
 */
export class ReturnCommand extends Command {
  readonly name = 'return';
  readonly description = 'Return to user view';
  readonly aliases = ['quit', 'q', 'exit'];

  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd === 'return' || cmd === 'quit' || cmd === 'q' || cmd === 'exit';
  }

  execute(context: CommandContext): CommandResult {
    const { device, normalizedCommand } = context;
    const output: string[] = [];
    const cmd = normalizedCommand.toLowerCase();

    if (cmd === 'return') {
      // return always goes to user-view
      device.cliState.view = 'user-view';
      device.cliState.currentInterfaceId = undefined;
      device.cliState.currentPoolName = undefined;
    } else {
      // quit/q/exit goes back one level
      if (device.cliState.view === 'interface-view' || device.cliState.view === 'pool-view') {
        device.cliState.view = 'system-view';
        device.cliState.currentInterfaceId = undefined;
        device.cliState.currentPoolName = undefined;
      } else if (device.cliState.view === 'system-view') {
        device.cliState.view = 'user-view';
      }
    }

    return this.createOutput(output, device);
  }
}
