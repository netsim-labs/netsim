/**
 * Traceroute Command - Trace route to destination (PC)
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { validateIpAddress, validateArgumentCount } from '../../validators/index.js';

export class TracerouteCommand extends Command {
  readonly name = 'traceroute';
  readonly description = 'Trace route to destination IP';
  readonly vendor = null; // Available on all PC devices

  canHandle(context: CommandContext): boolean {
    const isPc = context.device.vendor === 'PC' || context.device.model === 'PC';
    return isPc && context.normalizedCommand.toLowerCase() === 'traceroute';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const argCheck = validateArgumentCount(context.args, 2);
    if (!argCheck.valid) {
      return argCheck;
    }

    const ipCheck = validateIpAddress(context.args[1]);
    if (!ipCheck.valid) {
      return { valid: false, error: 'Invalid IP address' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, devices, cables, utils, args } = context;
    const output: string[] = [];

    const targetIp = args[1];
    const nic = device.ports[0];

    output.push(`Traceroute to ${targetIp}, 30 hops max`);

    // First hop is the default gateway
    const hop1 = device.defaultGateway || '192.168.1.1';
    output.push(` 1  ${hop1}  1 ms  1 ms`);

    // Find target device by IP
    const targetDevice = devices.find((d) =>
      d.ports.some((p) => p.config.ipAddress === targetIp) ||
      (d.vlanifs || []).some((v) => v.ipAddress === targetIp)
    );

    if (!targetDevice) {
      output.push('  *  *  *');
      output.push('  unreachable');
      return this.createOutput(output, device);
    }

    // Check if path exists
    const path = utils.findPath(device.id, targetDevice.id, cables, devices, nic?.config.vlan ?? 1);

    if (path) {
      output.push(` 2  ${targetIp}  5 ms  5 ms`);
    } else {
      output.push('  *  *  *');
      output.push('  unreachable');
    }

    return this.createOutput(output, device);
  }
}
