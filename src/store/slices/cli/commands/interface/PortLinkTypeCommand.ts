/**
 * Port Link Type Command - Configure port mode
 * Handles: port link-type <access|trunk|hybrid|routed>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { PortMode } from '../../../../../types/NetworkTypes.js';

export class PortLinkTypeCommand extends Command {
  readonly name = 'port link-type';
  readonly description = 'Configure port link type';
  readonly requiredView = ['interface-view'];

  canHandle(context: CommandContext): boolean {
    const { args } = context;
    return args[0]?.toLowerCase() === 'port' && args[1]?.toLowerCase() === 'link-type';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    const mode = context.args[2]?.toLowerCase();
    if (!mode) {
      return { valid: false, error: 'Error: port link-type <access|trunk|hybrid|routed>' };
    }

    if (!['access', 'trunk', 'hybrid', 'routed'].includes(mode)) {
      return { valid: false, error: 'Error: Invalid mode. Use access, trunk, hybrid, or routed.' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];
    const ifaceId = device.cliState.currentInterfaceId;
    const mode = args[2].toLowerCase() as PortMode;

    if (!ifaceId) {
      return this.createError('Interface not selected.');
    }

    // This command only applies to regular ports
    if (ifaceId.startsWith('vlanif') || ifaceId.startsWith('eth-trunk')) {
      return this.createError('Command not applicable to this interface type.');
    }

    const pIdx = device.ports.findIndex(p => p.id === ifaceId);
    if (pIdx === -1) {
      return this.createError('Interface not selected.');
    }

    device.ports[pIdx].config.mode = mode;

    // Initialize allowedVlans for trunk mode
    if (mode === 'trunk') {
      device.ports[pIdx].config.allowedVlans = device.ports[pIdx].config.allowedVlans ?? [1];
    }

    return this.createOutput(output, device);
  }
}
