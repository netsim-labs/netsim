/**
 * MikroTik RouterOS OSPF Commands
 * Handles: /routing ospf instance add name=<n> router-id=<ip>
 *          /routing ospf network add network=<prefix> area=<area>
 *          /routing ospf instance print
 *          /routing ospf neighbor print
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

/**
 * MikroTik Add OSPF Instance
 * Syntax: /routing ospf instance add name=<name> router-id=<ip>
 */
export class MikroTikOspfInstanceAddCommand extends Command {
  readonly name = '/routing ospf instance add';
  readonly description = 'Create OSPF instance (MikroTik RouterOS)';
  readonly vendor = 'mikrotik';
  readonly requiredView = ['user-view', 'system-view'];

  canHandle(context: CommandContext): boolean {
    if (context.profile.id !== 'mikrotik') {
      return false;
    }
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd.startsWith('/routing ospf instance add') ||
           cmd.startsWith('/routing/ospf/instance/add');
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const { normalizedCommand } = context;
    const cmd = normalizedCommand.toLowerCase();

    // router-id is required
    if (!cmd.includes('router-id=')) {
      return {
        valid: false,
        error: 'Error: Missing router-id parameter'
      };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, normalizedCommand } = context;
    const output: string[] = [];

    const params = this.parseParameters(normalizedCommand);
    const routerId = params['router-id'];
    const name = params['name'] || 'default';
    const redistribute = params['redistribute'] || '';

    if (!routerId) {
      return this.createError('Missing router-id');
    }

    // Enable OSPF
    device.ospfEnabled = true;
    device.routerId = routerId;

    // Store instance info
    if (!device.ospfTimers) {
      device.ospfTimers = {};
    }
    device.ospfTimers.instanceName = name;
    device.ospfTimers.redistribute = redistribute;

    // Initialize structures
    if (!device.ospfNeighbors) {
      device.ospfNeighbors = [];
    }
    if (!device.ospfLsdb) {
      device.ospfLsdb = [];
    }

    output.push(`[admin@${device.hostname}] > OSPF instance "${name}" created`);

    return this.createOutput(output, device);
  }

  private parseParameters(cmd: string): Record<string, string> {
    const params: Record<string, string> = {};
    const regex = /(\w+[-\w]*)=(?:"([^"]+)"|(\S+))/g;
    let match;

    while ((match = regex.exec(cmd)) !== null) {
      params[match[1].toLowerCase()] = match[2] || match[3];
    }

    return params;
  }
}

/**
 * MikroTik Add OSPF Network
 * Syntax: /routing ospf network add network=<prefix> area=<area>
 */
export class MikroTikOspfNetworkAddCommand extends Command {
  readonly name = '/routing ospf network add';
  readonly description = 'Add network to OSPF (MikroTik RouterOS)';
  readonly vendor = 'mikrotik';
  readonly requiredView = ['user-view', 'system-view'];

  canHandle(context: CommandContext): boolean {
    if (context.profile.id !== 'mikrotik') {
      return false;
    }
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd.startsWith('/routing ospf network add') ||
           cmd.startsWith('/routing/ospf/network/add');
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const { normalizedCommand, device } = context;
    const cmd = normalizedCommand.toLowerCase();

    if (!device.ospfEnabled) {
      return {
        valid: false,
        error: 'Error: OSPF not enabled. Create instance first with /routing ospf instance add'
      };
    }

    if (!cmd.includes('network=')) {
      return {
        valid: false,
        error: 'Error: Missing network parameter'
      };
    }

    if (!cmd.includes('area=')) {
      return {
        valid: false,
        error: 'Error: Missing area parameter'
      };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, normalizedCommand } = context;
    const output: string[] = [];

    const params = this.parseParameters(normalizedCommand);
    const networkCidr = params['network'];
    const area = params['area'] || 'backbone';

    if (!networkCidr) {
      return this.createError('Missing network parameter');
    }

    // Parse network
    let network: string;
    let mask: number;

    if (networkCidr.includes('/')) {
      [network, mask] = [networkCidr.split('/')[0], parseInt(networkCidr.split('/')[1], 10)];
    } else {
      network = networkCidr;
      mask = 24;
    }

    // Add to LSDB
    if (!device.ospfLsdb) {
      device.ospfLsdb = [];
    }

    device.ospfLsdb.push({
      type: 'network',
      network,
      mask,
      area,
      advertisedBy: device.hostname
    });

    output.push(`[admin@${device.hostname}] > network ${network}/${mask} added to area ${area}`);

    return this.createOutput(output, device);
  }

  private parseParameters(cmd: string): Record<string, string> {
    const params: Record<string, string> = {};
    const regex = /(\w+[-\w]*)=(?:"([^"]+)"|(\S+))/g;
    let match;

    while ((match = regex.exec(cmd)) !== null) {
      params[match[1].toLowerCase()] = match[2] || match[3];
    }

    return params;
  }
}

/**
 * MikroTik Print OSPF Instance
 * Syntax: /routing ospf instance print
 */
export class MikroTikOspfInstancePrintCommand extends Command {
  readonly name = '/routing ospf instance print';
  readonly description = 'Display OSPF instances (MikroTik RouterOS)';
  readonly vendor = 'mikrotik';

  canHandle(context: CommandContext): boolean {
    if (context.profile.id !== 'mikrotik') {
      return false;
    }
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd.startsWith('/routing ospf instance print') ||
           cmd === '/routing ospf instance';
  }

  execute(context: CommandContext): CommandResult {
    const { device } = context;
    const output: string[] = [];

    output.push(`[admin@${device.hostname}] > /routing ospf instance print`);
    output.push('Flags: X - disabled, * - default');
    output.push(' #   NAME       ROUTER-ID        REDISTRIBUTE');

    if (!device.ospfEnabled) {
      output.push(' (no OSPF instances)');
    } else {
      const name = device.ospfTimers?.instanceName || 'default';
      const routerId = device.routerId || '0.0.0.0';
      const redistribute = device.ospfTimers?.redistribute || '';
      output.push(` 0 * ${name.padEnd(10)} ${routerId.padEnd(16)} ${redistribute}`);
    }

    return this.createOutput(output);
  }
}

/**
 * MikroTik Print OSPF Neighbors
 * Syntax: /routing ospf neighbor print
 */
export class MikroTikOspfNeighborPrintCommand extends Command {
  readonly name = '/routing ospf neighbor print';
  readonly description = 'Display OSPF neighbors (MikroTik RouterOS)';
  readonly vendor = 'mikrotik';

  canHandle(context: CommandContext): boolean {
    if (context.profile.id !== 'mikrotik') {
      return false;
    }
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd.startsWith('/routing ospf neighbor print') ||
           cmd === '/routing ospf neighbor';
  }

  execute(context: CommandContext): CommandResult {
    const { device } = context;
    const output: string[] = [];

    output.push(`[admin@${device.hostname}] > /routing ospf neighbor print`);
    output.push(' # ROUTER-ID        ADDRESS          INTERFACE         STATE');

    if (!device.ospfNeighbors || device.ospfNeighbors.length === 0) {
      output.push(' (no OSPF neighbors)');
    } else {
      device.ospfNeighbors.forEach((neighbor, index) => {
        const routerId = neighbor.neighborId.padEnd(16);
        const address = (neighbor.address || '0.0.0.0').padEnd(16);
        const iface = neighbor.interface.padEnd(17);
        const state = neighbor.state;
        output.push(` ${index} ${routerId} ${address} ${iface} ${state}`);
      });
    }

    return this.createOutput(output);
  }
}

/**
 * MikroTik Set OSPF Timers
 * Syntax: /routing ospf interface add interface=<iface> hello-interval=<sec> dead-interval=<sec>
 */
export class MikroTikOspfInterfaceAddCommand extends Command {
  readonly name = '/routing ospf interface add';
  readonly description = 'Configure OSPF interface (MikroTik RouterOS)';
  readonly vendor = 'mikrotik';
  readonly requiredView = ['user-view', 'system-view'];

  canHandle(context: CommandContext): boolean {
    if (context.profile.id !== 'mikrotik') {
      return false;
    }
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd.startsWith('/routing ospf interface add') ||
           cmd.startsWith('/routing/ospf/interface/add');
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const { device } = context;

    if (!device.ospfEnabled) {
      return {
        valid: false,
        error: 'Error: OSPF not enabled. Create instance first.'
      };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, normalizedCommand } = context;
    const output: string[] = [];

    const params = this.parseParameters(normalizedCommand);
    const iface = params['interface'] || 'all';
    const helloInterval = params['hello-interval'] ? parseInt(params['hello-interval'], 10) : 10;
    const deadInterval = params['dead-interval'] ? parseInt(params['dead-interval'], 10) : 40;
    const cost = params['cost'] ? parseInt(params['cost'], 10) : 10;

    // Store timers
    if (!device.ospfTimers) {
      device.ospfTimers = {};
    }
    device.ospfTimers.hello = helloInterval;
    device.ospfTimers.dead = deadInterval;
    device.ospfTimers.interface = iface;
    device.ospfTimers.cost = cost;

    output.push(`[admin@${device.hostname}] > OSPF interface configured`);
    output.push(`  hello-interval: ${helloInterval}s, dead-interval: ${deadInterval}s`);

    return this.createOutput(output, device);
  }

  private parseParameters(cmd: string): Record<string, string> {
    const params: Record<string, string> = {};
    const regex = /(\w+[-\w]*)=(?:"([^"]+)"|(\S+))/g;
    let match;

    while ((match = regex.exec(cmd)) !== null) {
      params[match[1].toLowerCase()] = match[2] || match[3];
    }

    return params;
  }
}
