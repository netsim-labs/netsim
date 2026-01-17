/**
 * Port Default VLAN Command - Set default VLAN for port
 * Handles: port default vlan <id>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class PortDefaultVlanCommand extends Command {
  readonly name = 'port default vlan';
  readonly description = 'Set default VLAN for port';
  readonly requiredView = ['interface-view'];

  canHandle(context: CommandContext): boolean {
    const { args } = context;
    return (
      args[0]?.toLowerCase() === 'port' &&
      args[1]?.toLowerCase() === 'default' &&
      args[2]?.toLowerCase() === 'vlan'
    );
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    const vlanId = Number.parseInt(context.args[3], 10);
    if (Number.isNaN(vlanId)) {
      return { valid: false, error: 'Error: port default vlan <id>' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];
    const ifaceId = device.cliState.currentInterfaceId;
    const vlanId = Number.parseInt(args[3], 10);

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

    // Check if VLAN exists
    if (!device.vlans.includes(vlanId)) {
      return this.createError('VLAN not found.');
    }

    device.ports[pIdx].config.vlan = vlanId;

    return this.createOutput(output, device);
  }
}
