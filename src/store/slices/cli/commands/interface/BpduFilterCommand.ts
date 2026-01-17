/**
 * BPDU Filter Command - Configure BPDU filter on port
 * Handles: bpdu filter enable|disable
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class BpduFilterCommand extends Command {
  readonly name = 'bpdu filter';
  readonly description = 'Configure BPDU filter on port';
  readonly requiredView = ['interface-view'];

  canHandle(context: CommandContext): boolean {
    const { args } = context;
    return args[0]?.toLowerCase() === 'bpdu' && args[1]?.toLowerCase() === 'filter';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    const action = context.args[2]?.toLowerCase();
    if (!action || !['enable', 'disable'].includes(action)) {
      return { valid: false, error: 'Error: bpdu filter enable|disable' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];
    const ifaceId = device.cliState.currentInterfaceId;
    const action = args[2].toLowerCase();

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

    device.ports[pIdx].config.bpduFilter = action === 'enable';
    output.push(`Info: BPDU filter ${action}d.`);

    return this.createOutput(output, device);
  }
}
