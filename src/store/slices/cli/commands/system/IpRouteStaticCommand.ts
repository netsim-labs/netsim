/**
 * IP Route Static Command - Configure static route
 * Handles: ip route-static <dest> <mask> <nexthop>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class IpRouteStaticCommand extends Command {
  readonly name = 'ip route-static';
  readonly description = 'Configure static route';
  readonly requiredView = ['system-view'];

  canHandle(context: CommandContext): boolean {
    const { args } = context;
    return args[0]?.toLowerCase() === 'ip' && args[1]?.toLowerCase() === 'route-static';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    if (context.args.length < 5) {
      return { valid: false, error: 'Error: Usage ip route-static <dest> <mask> <nexthop>' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];

    const dest = args[2];
    const mask = Number.parseInt(args[3], 10);
    const nextHop = args[4];

    const route = {
      destination: dest,
      mask: Number.isNaN(mask) ? 24 : mask,
      proto: 'Static' as const,
      pre: 60,
      cost: 0,
      nextHop,
      interface: ''
    };

    device.routingTable = [...(device.routingTable || []), route];
    output.push('Info: Succeeded.');

    return this.createOutput(output, device);
  }
}
