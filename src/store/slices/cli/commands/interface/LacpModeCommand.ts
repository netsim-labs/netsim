/**
 * LACP Mode Command - Configure LACP mode on Eth-Trunk
 * Handles: lacp mode <static|active|passive>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { LacpMode } from '../../../../../types/NetworkTypes.js';
import { initializeLacpState } from '../../../../../utils/lacpUtils.js';

export class LacpModeCommand extends Command {
  readonly name = 'lacp mode';
  readonly description = 'Configure LACP mode on Eth-Trunk';
  readonly requiredView = ['interface-view'];

  canHandle(context: CommandContext): boolean {
    const { args, device } = context;
    // Only handle when in eth-trunk interface-view
    const ifaceId = device.cliState.currentInterfaceId;
    if (!ifaceId?.startsWith('eth-trunk')) {
      return false;
    }
    return args[0]?.toLowerCase() === 'lacp' && args[1]?.toLowerCase() === 'mode';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    const mode = context.args[2]?.toLowerCase();
    if (!mode || !['static', 'active', 'passive'].includes(mode)) {
      return { valid: false, error: 'Error: mode must be static/active/passive.' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];
    const ifaceId = device.cliState.currentInterfaceId;
    const mode = args[2].toLowerCase() as LacpMode;

    if (!ifaceId) {
      return this.createError('Interface not selected.');
    }

    device.ethTrunks = device.ethTrunks || [];
    const idx = device.ethTrunks.findIndex(t => `eth-trunk${t.id}` === ifaceId);

    if (idx === -1) {
      return this.createError('Interface not selected.');
    }

    const trunk = device.ethTrunks[idx];
    trunk.mode = mode;

    // Initialize LACP state if enabling LACP
    if (mode === 'active' || mode === 'passive') {
      initializeLacpState(trunk, device);
      output.push(`Info: LACP mode set to ${mode}, protocol initialized.`);
    } else {
      // Disable LACP
      trunk.lacpEnabled = false;
      trunk.ports = {};
      output.push(`Info: LACP mode set to ${mode}, protocol disabled.`);
    }

    return this.createOutput(output, device);
  }
}
