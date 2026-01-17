/**
 * QinQ Command - Enable/disable QinQ tunneling
 * Handles: qinq, undo qinq
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class QinqCommand extends Command {
  readonly name = 'qinq';
  readonly description = 'Enable/disable QinQ tunneling on port';
  readonly requiredView = ['interface-view'];

  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd === 'qinq' || cmd === 'undo qinq';
  }

  execute(context: CommandContext): CommandResult {
    const { device, normalizedCommand } = context;
    const output: string[] = [];
    const isUndo = normalizedCommand.toLowerCase() === 'undo qinq';
    const ifaceId = device.cliState.currentInterfaceId;

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

    device.ports[pIdx].config.qinqTunnel = !isUndo;
    output.push(isUndo ? 'Info: QinQ tunnel disabled.' : 'Info: QinQ tunnel enabled (passthrough).');

    return this.createOutput(output, device);
  }
}
