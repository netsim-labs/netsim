/**
 * VLAN Command - VLAN configuration
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { validateVlanId, validateCliView } from '../../validators/index.js';

export class VlanCommand extends Command {
  readonly name = 'vlan';
  readonly description = 'Configure VLANs';
  readonly requiredView = ['system-view'];
  readonly vendor = null; // Support both Huawei and Cisco

  canHandle(context: CommandContext): boolean {
    return context.args[0]?.toLowerCase() === 'vlan';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = validateCliView(context.device, this.requiredView!);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    const { args, profile } = context;

    if (args.length < 2) {
      return { valid: false, error: 'VLAN command requires VLAN ID or subcommand' };
    }

    // Huawei: vlan batch <vlan-ids>
    if (profile.id === 'huawei') {
      const subCmd = args[1]?.toLowerCase();
      if (subCmd === 'batch') {
        if (args.length < 3) {
          return { valid: false, error: 'vlan batch requires VLAN IDs' };
        }
        // Validate all VLAN IDs
        for (let i = 2; i < args.length; i++) {
          const vlanId = parseInt(args[i], 10);
          const vlanCheck = validateVlanId(vlanId);
          if (!vlanCheck.valid) {
            return { valid: false, error: `Invalid VLAN ID ${args[i]}: ${vlanCheck.error}` };
          }
        }
      } else {
        return { valid: false, error: 'Huawei VLAN command requires "batch" subcommand' };
      }
    }
    // Cisco: vlan <id> (enters vlan config mode)
    else if (profile.id === 'cisco') {
      const vlanId = parseInt(args[1], 10);
      const vlanCheck = validateVlanId(vlanId);
      if (!vlanCheck.valid) {
        return { valid: false, error: `Invalid VLAN ID ${args[1]}: ${vlanCheck.error}` };
      }
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args, profile } = context;
    const output: string[] = [];

    if (profile.id === 'huawei') {
      // Huawei: vlan batch <vlan-ids>
      const subCmd = args[1]?.toLowerCase();
      if (subCmd === 'batch') {
        const newVlans = args.slice(2).map(v => parseInt(v, 10)).filter(v => !isNaN(v));
        device.vlans = [...new Set([...device.vlans, ...newVlans])].sort((a, b) => a - b);
        output.push(`Info: VLANs creadas ${newVlans.join(', ')}`);
        return this.createOutput(output, device);
      }
    }
    else if (profile.id === 'cisco') {
      // Cisco: vlan <id> - create VLAN
      const vlanId = parseInt(args[1], 10);
      if (!device.vlans.includes(vlanId)) {
        device.vlans = [...device.vlans, vlanId].sort((a, b) => a - b);
        output.push(`${device.hostname}(config)# vlan ${vlanId}`);
        output.push(`${device.hostname}(config-vlan)#`);
      } else {
        output.push(`VLAN ${vlanId} already exists`);
      }
      return this.createOutput(output, device);
    }

    return this.createError('Unknown VLAN command format');
  }
}
