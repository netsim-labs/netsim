/**
 * MikroTik RouterOS IP Route Commands
 * Handles: /ip route add dst-address=<prefix/mask> gateway=<gw>
 *          /ip route print
 *          /ip route remove numbers=<n>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

/**
 * MikroTik Add IP Route
 * Syntax: /ip route add dst-address=<prefix/mask> gateway=<gateway>
 */
export class MikroTikIpRouteAddCommand extends Command {
  readonly name = '/ip route add';
  readonly description = 'Add static route (MikroTik RouterOS)';
  readonly vendor = 'mikrotik';
  readonly requiredView = ['user-view', 'system-view'];

  canHandle(context: CommandContext): boolean {
    if (context.profile.id !== 'mikrotik') {
      return false;
    }
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd.startsWith('/ip route add') || cmd.startsWith('/ip/route/add');
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const { normalizedCommand } = context;
    const cmd = normalizedCommand.toLowerCase();

    // Check for required parameters
    if (!cmd.includes('dst-address=') && !cmd.includes('dst=')) {
      return {
        valid: false,
        error: 'Error: Missing dst-address parameter'
      };
    }

    if (!cmd.includes('gateway=') && !cmd.includes('gw=')) {
      return {
        valid: false,
        error: 'Error: Missing gateway parameter'
      };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, normalizedCommand } = context;
    const output: string[] = [];

    // Parse MikroTik style parameters
    const params = this.parseParameters(normalizedCommand);

    const dstAddress = params['dst-address'] || params['dst'];
    const gateway = params['gateway'] || params['gw'];
    const distance = params['distance'] ? parseInt(params['distance'], 10) : 1;

    if (!dstAddress || !gateway) {
      return this.createError('Missing required parameters');
    }

    // Parse CIDR
    let destination: string;
    let mask: number;

    if (dstAddress.includes('/')) {
      [destination, mask] = [dstAddress.split('/')[0], parseInt(dstAddress.split('/')[1], 10)];
    } else {
      destination = dstAddress;
      mask = 32; // Host route
    }

    // Initialize routing table
    if (!device.routingTable) {
      device.routingTable = [];
    }

    // Check for duplicate
    const exists = device.routingTable.some(
      r => r.destination === destination && r.mask === mask && r.nextHop === gateway
    );

    if (exists) {
      output.push('failure: route already exists');
      return this.createOutput(output);
    }

    // Add route
    const route = {
      destination,
      mask,
      proto: 'Static' as const,
      pre: distance,
      cost: 0,
      nextHop: gateway,
      interface: ''
    };

    device.routingTable.push(route);

    // MikroTik style output - just returns nothing on success or the item number
    const routeNum = device.routingTable.length - 1;
    output.push(`[admin@${device.hostname}] > added ${routeNum}`);

    return this.createOutput(output, device);
  }

  private parseParameters(cmd: string): Record<string, string> {
    const params: Record<string, string> = {};
    // Match key=value or key="value with spaces"
    const regex = /(\w+[-\w]*)=(?:"([^"]+)"|(\S+))/g;
    let match;

    while ((match = regex.exec(cmd)) !== null) {
      const key = match[1].toLowerCase();
      const value = match[2] || match[3];
      params[key] = value;
    }

    return params;
  }
}

/**
 * MikroTik Print IP Routes
 * Syntax: /ip route print
 */
export class MikroTikIpRoutePrintCommand extends Command {
  readonly name = '/ip route print';
  readonly description = 'Display routing table (MikroTik RouterOS)';
  readonly vendor = 'mikrotik';

  canHandle(context: CommandContext): boolean {
    if (context.profile.id !== 'mikrotik') {
      return false;
    }
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd.startsWith('/ip route print') || cmd === '/ip route';
  }

  execute(context: CommandContext): CommandResult {
    const { device } = context;
    const output: string[] = [];

    output.push(`[admin@${device.hostname}] > /ip route print`);
    output.push('Flags: D - dynamic, A - active, c - connect, S - static, r - rip, b - bgp');
    output.push(' #      DST-ADDRESS        GATEWAY            DISTANCE');

    if (!device.routingTable || device.routingTable.length === 0) {
      output.push(' (no routes)');
    } else {
      device.routingTable.forEach((route, index) => {
        const flags = route.proto === 'Static' ? 'AS' :
                      route.proto === 'Direct' ? 'ADc' : 'AD';
        const dst = `${route.destination}/${route.mask}`.padEnd(18);
        const gw = (route.nextHop || 'connected').padEnd(18);
        const dist = route.pre.toString();
        output.push(` ${index.toString().padStart(2)} ${flags.padEnd(4)} ${dst} ${gw} ${dist}`);
      });
    }

    return this.createOutput(output);
  }
}

/**
 * MikroTik Remove IP Route
 * Syntax: /ip route remove numbers=<n>
 */
export class MikroTikIpRouteRemoveCommand extends Command {
  readonly name = '/ip route remove';
  readonly description = 'Remove static route (MikroTik RouterOS)';
  readonly vendor = 'mikrotik';
  readonly requiredView = ['user-view', 'system-view'];

  canHandle(context: CommandContext): boolean {
    if (context.profile.id !== 'mikrotik') {
      return false;
    }
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd.startsWith('/ip route remove');
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const { normalizedCommand } = context;

    if (!normalizedCommand.includes('numbers=') && !normalizedCommand.includes('.id=')) {
      // Check if it's a positional argument
      const parts = normalizedCommand.split(/\s+/);
      if (parts.length < 4 || isNaN(parseInt(parts[3], 10))) {
        return {
          valid: false,
          error: 'Error: Specify route number to remove (numbers=<n>)'
        };
      }
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, normalizedCommand } = context;
    const output: string[] = [];

    // Parse route number
    let routeNum: number;
    const numbersMatch = normalizedCommand.match(/numbers?=(\d+)/);

    if (numbersMatch) {
      routeNum = parseInt(numbersMatch[1], 10);
    } else {
      // Try positional
      const parts = normalizedCommand.split(/\s+/);
      routeNum = parseInt(parts[3], 10);
    }

    if (!device.routingTable || routeNum >= device.routingTable.length || routeNum < 0) {
      output.push('failure: no such item');
      return this.createOutput(output);
    }

    // Only remove static routes
    if (device.routingTable[routeNum].proto !== 'Static') {
      output.push('failure: cannot remove non-static route');
      return this.createOutput(output);
    }

    device.routingTable.splice(routeNum, 1);
    output.push(`[admin@${device.hostname}] >`);

    return this.createOutput(output, device);
  }
}
