/**
 * Loopback Detect Command - Configure loop detection on port
 * Handles: loopback-detect enable, loopback-detect action <shutdown|log>, undo loopback-detect
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class LoopbackDetectCommand extends Command {
  readonly name = 'loopback-detect';
  readonly description = 'Configure loop detection on port';
  readonly requiredView = ['interface-view'];

  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();
    return (
      context.args[0]?.toLowerCase() === 'loopback-detect' ||
      cmd === 'undo loopback-detect' ||
      cmd === 'undo loopback-detect enable'
    );
  }

  execute(context: CommandContext): CommandResult {
    const { device, args, normalizedCommand } = context;
    const output: string[] = [];
    const ifaceId = device.cliState.currentInterfaceId;
    const cmd = normalizedCommand.toLowerCase();

    if (!ifaceId) {
      return this.createError('Interface not selected.');
    }

    // Only applies to regular ports
    if (ifaceId.startsWith('vlanif') || ifaceId.startsWith('eth-trunk')) {
      return this.createError('Command not applicable to this interface type.');
    }

    const pIdx = device.ports.findIndex(p => p.id === ifaceId);
    if (pIdx === -1) {
      return this.createError('Interface not selected.');
    }

    // Handle undo loopback-detect
    if (cmd === 'undo loopback-detect' || cmd === 'undo loopback-detect enable') {
      device.ports[pIdx].config.loopDetectEnabled = false;
      device.ports[pIdx].loopDetected = false;
      device.ports[pIdx].loopLastEvent = undefined;
      output.push('Info: loopback-detect disabled.');
      return this.createOutput(output, device);
    }

    const subCmd = args[1]?.toLowerCase();

    if (subCmd === 'enable') {
      device.ports[pIdx].config.loopDetectEnabled = true;
      output.push('Info: loopback-detect enabled.');
    } else if (subCmd === 'action' && args[2]) {
      const action = args[2].toLowerCase();
      if (action === 'shutdown' || action === 'log') {
        device.ports[pIdx].config.loopDetectAction = action as 'shutdown' | 'log';
        output.push(`Info: loopback-detect action ${action}.`);
      } else {
        return this.createError('action must be shutdown|log');
      }
    } else {
      return this.createError('loopback-detect enable | loopback-detect action <shutdown|log>');
    }

    return this.createOutput(output, device);
  }
}
