/**
 * BPDU Guard Command - Configure BPDU guard on port
 * Handles: bpdu guard enable|disable
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class BpduGuardCommand extends Command {
  readonly name = 'bpdu guard';
  readonly description = 'Configure BPDU guard on port';
  readonly requiredView = ['interface-view'];

  canHandle(context: CommandContext): boolean {
    const { args } = context;
    return args[0]?.toLowerCase() === 'bpdu' && args[1]?.toLowerCase() === 'guard';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    const action = context.args[2]?.toLowerCase();
    if (!action || !['enable', 'disable'].includes(action)) {
      return { valid: false, error: 'Error: bpdu guard enable|disable' };
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

    device.ports[pIdx].config.bpduGuard = action === 'enable';
    output.push(`Info: BPDU guard ${action}d.`);

    return this.createOutput(output, device);
  }
}
