/**
 * Loop Guard Command - Configure Loop Guard on port
 * Handles: loop-guard enable|disable
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class LoopGuardCommand extends Command {
  readonly name = 'loop-guard';
  readonly description = 'Configure Loop Guard on port';
  readonly requiredView = ['interface-view'];

  canHandle(context: CommandContext): boolean {
    return context.args[0]?.toLowerCase() === 'loop-guard';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    const action = context.args[1]?.toLowerCase();
    if (!action || !['enable', 'disable'].includes(action)) {
      return { valid: false, error: 'Error: loop-guard enable|disable' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];
    const ifaceId = device.cliState.currentInterfaceId;
    const action = args[1].toLowerCase();

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

    device.ports[pIdx].config.loopGuard = action === 'enable';
    output.push(`Info: Loop Guard ${action}d.`);

    return this.createOutput(output, device);
  }
}
