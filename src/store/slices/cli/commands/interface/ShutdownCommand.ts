/**
 * Shutdown Command - Enable/disable interface
 * Handles: shutdown, undo shutdown
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class ShutdownCommand extends Command {
  readonly name = 'shutdown';
  readonly description = 'Disable interface';
  readonly requiredView = ['interface-view'];
  readonly vendor = null; // Support both Huawei and Cisco

  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd === 'shutdown' || cmd === 'undo shutdown' || cmd === 'no shutdown';
  }

  execute(context: CommandContext): CommandResult {
    const { device, normalizedCommand } = context;
    const output: string[] = [];
    const cmd = normalizedCommand.toLowerCase();
    const isUndo = cmd === 'undo shutdown' || cmd === 'no shutdown';
    const ifaceId = device.cliState.currentInterfaceId;

    if (!ifaceId) {
      return this.createError('Interface not selected.');
    }

    // Handle vlanif
    if (ifaceId.startsWith('vlanif')) {
      return this.handleVlanif(device, ifaceId, isUndo, output);
    }

    // Handle eth-trunk
    if (ifaceId.startsWith('eth-trunk')) {
      return this.handleEthTrunk(device, ifaceId, isUndo, output);
    }

    // Handle regular port
    return this.handlePort(device, ifaceId, isUndo, output);
  }

  private handleVlanif(
    device: CommandContext['device'],
    ifaceId: string,
    isUndo: boolean,
    output: string[]
  ): CommandResult {
    device.vlanifs = device.vlanifs || [];
    const idx = device.vlanifs.findIndex(v => v.id === ifaceId);

    if (idx === -1) {
      return this.createError('Interface not selected.');
    }

    device.vlanifs[idx].enabled = isUndo;
    return this.createOutput(output, device);
  }

  private handleEthTrunk(
    device: CommandContext['device'],
    ifaceId: string,
    isUndo: boolean,
    output: string[]
  ): CommandResult {
    device.ethTrunks = device.ethTrunks || [];
    const idx = device.ethTrunks.findIndex(t => `eth-trunk${t.id}` === ifaceId);

    if (idx === -1) {
      return this.createError('Interface not selected.');
    }

    device.ethTrunks[idx].enabled = isUndo;
    return this.createOutput(output, device);
  }

  private handlePort(
    device: CommandContext['device'],
    ifaceId: string,
    isUndo: boolean,
    output: string[]
  ): CommandResult {
    const pIdx = device.ports.findIndex(p => p.id === ifaceId);

    if (pIdx === -1) {
      return this.createError('Interface not selected.');
    }

    device.ports[pIdx].config.enabled = isUndo;
    device.ports[pIdx].status = isUndo
      ? (device.ports[pIdx].connectedCableId ? 'up' : 'down')
      : 'down';

    return this.createOutput(output, device);
  }
}
