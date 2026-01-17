/**
 * Aruba CX IP Route Command - Configure static route
 * Handles: ip route <prefix/mask> <nexthop>
 * Example: ip route 10.0.0.0/24 192.168.1.1
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class ArubaIpRouteCommand extends Command {
  readonly name = 'ip route';
  readonly description = 'Configure static route (Aruba CX syntax)';
  readonly vendor = 'aruba';
  readonly requiredView = ['system-view'];

  canHandle(context: CommandContext): boolean {
    if (context.profile.id !== 'aruba') {
      return false;
    }
    const { args } = context;
    // Match: ip route <prefix/mask> <nexthop>
    // Avoid matching 'ip route-static' (Huawei)
    return (
      args[0]?.toLowerCase() === 'ip' &&
      args[1]?.toLowerCase() === 'route' &&
      args[1]?.toLowerCase() !== 'route-static'
    );
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    const { args } = context;

    // Need at least: ip route <prefix/mask> <nexthop>
    if (args.length < 4) {
      return {
        valid: false,
        error: 'Error: Usage: ip route <prefix/mask> <nexthop>'
      };
    }

    // Validate CIDR notation (prefix/mask)
    const cidr = args[2];
    if (!cidr.includes('/')) {
      return {
        valid: false,
        error: 'Error: Prefix must be in CIDR notation (e.g., 10.0.0.0/24)'
      };
    }

    const [prefix, maskStr] = cidr.split('/');
    const mask = parseInt(maskStr, 10);

    // Validate IP prefix format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(prefix)) {
      return {
        valid: false,
        error: 'Error: Invalid IP prefix format'
      };
    }

    // Validate mask range
    if (isNaN(mask) || mask < 0 || mask > 32) {
      return {
        valid: false,
        error: 'Error: Mask must be between 0 and 32'
      };
    }

    // Validate nexthop IP
    const nextHop = args[3];
    if (!ipRegex.test(nextHop)) {
      return {
        valid: false,
        error: 'Error: Invalid next-hop IP address'
      };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];

    const cidr = args[2];
    const [destination, maskStr] = cidr.split('/');
    const mask = parseInt(maskStr, 10);
    const nextHop = args[3];

    // Initialize routing table if needed
    if (!device.routingTable) {
      device.routingTable = [];
    }

    // Check for duplicate route
    const existingRoute = device.routingTable.find(
      r => r.destination === destination && r.mask === mask && r.nextHop === nextHop
    );

    if (existingRoute) {
      output.push('% Route already exists.');
      return this.createOutput(output);
    }

    // Add the route
    const route = {
      destination,
      mask,
      proto: 'Static' as const,
      pre: 1, // Aruba uses administrative distance 1 for static
      cost: 0,
      nextHop,
      interface: ''
    };

    device.routingTable.push(route);
    output.push(`Static route ${destination}/${mask} via ${nextHop} configured.`);

    return this.createOutput(output, device);
  }
}

/**
 * Aruba CX No IP Route Command - Remove static route
 * Handles: no ip route <prefix/mask> <nexthop>
 */
export class ArubaNoIpRouteCommand extends Command {
  readonly name = 'no ip route';
  readonly description = 'Remove static route (Aruba CX syntax)';
  readonly vendor = 'aruba';
  readonly requiredView = ['system-view'];

  canHandle(context: CommandContext): boolean {
    if (context.profile.id !== 'aruba') {
      return false;
    }
    const { args } = context;
    return (
      args[0]?.toLowerCase() === 'no' &&
      args[1]?.toLowerCase() === 'ip' &&
      args[2]?.toLowerCase() === 'route'
    );
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    if (context.args.length < 5) {
      return {
        valid: false,
        error: 'Error: Usage: no ip route <prefix/mask> <nexthop>'
      };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];

    const cidr = args[3];
    const [destination, maskStr] = cidr.split('/');
    const mask = parseInt(maskStr, 10);
    const nextHop = args[4];

    if (!device.routingTable) {
      output.push('% Route not found.');
      return this.createOutput(output);
    }

    const initialLength = device.routingTable.length;
    device.routingTable = device.routingTable.filter(
      r => !(r.destination === destination && r.mask === mask && r.nextHop === nextHop)
    );

    if (device.routingTable.length === initialLength) {
      output.push('% Route not found.');
    } else {
      output.push(`Static route ${destination}/${mask} via ${nextHop} removed.`);
    }

    return this.createOutput(output, device);
  }
}
