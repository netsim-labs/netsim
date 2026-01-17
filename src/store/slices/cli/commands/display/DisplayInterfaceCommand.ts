/**
 * Display Interface Command - Show interface information
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { formatInterfaceSummary } from '../../formatters.js';

export class DisplayInterfaceCommand extends Command {
  readonly name = 'display interface';
  readonly description = 'Display interface information';
  readonly aliases = ['dis int', 'display int'];

  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd.startsWith('display interface') ||
           cmd.startsWith('dis int') ||
           cmd.startsWith('display int');
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];

    // display interface brief
    if (args[2]?.toLowerCase() === 'brief' || args[2]?.toLowerCase() === 'br') {
      output.push('Interface                  Status       Protocol     VLAN');
      device.ports.forEach(port => {
        output.push(formatInterfaceSummary(port));
      });
      return this.createOutput(output);
    }

    // display interface <name>
    if (args[2]) {
      const portName = args[2];
      const port = device.ports.find(p => p.name.toLowerCase() === portName.toLowerCase());

      if (!port) {
        return this.createError(`Interface ${portName} not found`);
      }

      output.push(`Interface: ${port.name}`);
      output.push(`  Status: ${port.status}`);
      output.push(`  Mode: ${port.config.mode || 'hybrid'}`);
      output.push(`  VLAN: ${port.config.vlan ?? 1}`);
      if (port.config.ipAddress) {
        output.push(`  IP Address: ${port.config.ipAddress}/${port.config.subnetMask ?? 24}`);
      }
      if (port.config.allowedVlans && port.config.allowedVlans.length > 0) {
        output.push(`  Allowed VLANs: ${port.config.allowedVlans.join(', ')}`);
      }
      if (port.config.qos) {
        output.push(`  QoS: enabled`);
        if (port.config.qos.limitMbps) {
          output.push(`    Limit: ${port.config.qos.limitMbps} Mbps`);
        }
        if (port.config.qos.shapePct) {
          output.push(`    Shape: ${port.config.qos.shapePct}%`);
        }
      }

      return this.createOutput(output);
    }

    // display interface (no args) - show all
    output.push('Interfaces:');
    device.ports.forEach(port => {
      output.push(`  ${port.name} - ${port.status}`);
    });

    return this.createOutput(output);
  }
}
