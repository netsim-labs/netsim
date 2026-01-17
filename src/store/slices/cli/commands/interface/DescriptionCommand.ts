/**
 * Description Command - Set interface description
 * Handles: description <text>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class DescriptionCommand extends Command {
  readonly name = 'description';
  readonly description = 'Set interface description';
  readonly requiredView = ['interface-view'];

  canHandle(context: CommandContext): boolean {
    return context.args[0]?.toLowerCase() === 'description';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    if (!context.args[1]) {
      return { valid: false, error: 'Error: description <text>' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];
    const ifaceId = device.cliState.currentInterfaceId;
    const descText = args.slice(1).join(' ');

    if (!ifaceId) {
      return this.createError('Interface not selected.');
    }

    // Handle vlanif
    if (ifaceId.startsWith('vlanif')) {
      device.vlanifs = device.vlanifs || [];
      const idx = device.vlanifs.findIndex(v => v.id === ifaceId);
      if (idx === -1) {
        return this.createError('Interface not selected.');
      }
      device.vlanifs[idx].description = descText;
      return this.createOutput(output, device);
    }

    // Handle eth-trunk
    if (ifaceId.startsWith('eth-trunk')) {
      device.ethTrunks = device.ethTrunks || [];
      const idx = device.ethTrunks.findIndex(t => `eth-trunk${t.id}` === ifaceId);
      if (idx === -1) {
        return this.createError('Interface not selected.');
      }
      device.ethTrunks[idx].description = descText;
      return this.createOutput(output, device);
    }

    // Handle regular port
    const pIdx = device.ports.findIndex(p => p.id === ifaceId);
    if (pIdx === -1) {
      return this.createError('Interface not selected.');
    }
    device.ports[pIdx].config.description = descText;

    return this.createOutput(output, device);
  }
}
