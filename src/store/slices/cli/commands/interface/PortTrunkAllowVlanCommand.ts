/**
 * Port Trunk Allow VLAN Command - Configure allowed VLANs on trunk
 * Handles: port trunk allow-pass vlan <ids...>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class PortTrunkAllowVlanCommand extends Command {
  readonly name = 'port trunk allow-pass vlan';
  readonly description = 'Configure allowed VLANs on trunk port';
  readonly requiredView = ['interface-view'];

  canHandle(context: CommandContext): boolean {
    const { args } = context;
    return (
      args[0]?.toLowerCase() === 'port' &&
      args[1]?.toLowerCase() === 'trunk' &&
      args[2]?.toLowerCase() === 'allow-pass' &&
      args[3]?.toLowerCase() === 'vlan'
    );
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    if (!context.args[4]) {
      return { valid: false, error: 'Error: port trunk allow-pass vlan <vlan-ids>' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];
    const ifaceId = device.cliState.currentInterfaceId;

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

    // Parse VLAN IDs from args[4] onwards
    const vlanIds = args.slice(4)
      .map(v => Number.parseInt(v, 10))
      .filter(v => !Number.isNaN(v));

    // Filter only valid VLANs that exist on the device
    const validVlans = vlanIds.filter(v => device.vlans.includes(v));

    // Merge with existing allowed VLANs
    const existingVlans = device.ports[pIdx].config.allowedVlans || [];
    device.ports[pIdx].config.allowedVlans = [...new Set([...existingVlans, ...validVlans])];

    output.push('Info: Done.');
    return this.createOutput(output, device);
  }
}
