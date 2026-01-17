/**
 * Aruba CX OSPF Commands - Configure OSPF routing
 * Handles: router ospf <process-id>
 *          area <area-id>
 *          network <prefix/mask> area <area-id>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

/**
 * Enter OSPF router configuration mode
 * Syntax: router ospf <process-id>
 */
export class ArubaRouterOspfCommand extends Command {
  readonly name = 'router ospf';
  readonly description = 'Enter OSPF router configuration (Aruba CX)';
  readonly vendor = 'aruba';
  readonly requiredView = ['system-view'];

  canHandle(context: CommandContext): boolean {
    if (context.profile.id !== 'aruba') {
      return false;
    }
    const { args } = context;
    return (
      args[0]?.toLowerCase() === 'router' &&
      args[1]?.toLowerCase() === 'ospf'
    );
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    const { args } = context;
    if (args.length < 3) {
      return {
        valid: false,
        error: 'Error: Usage: router ospf <process-id>'
      };
    }

    const processId = parseInt(args[2], 10);
    if (isNaN(processId) || processId < 1 || processId > 65535) {
      return {
        valid: false,
        error: 'Error: Process ID must be between 1 and 65535'
      };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];

    const processId = parseInt(args[2], 10);

    // Enable OSPF
    device.ospfEnabled = true;

    // Store process ID (using ospfTimers as a container for now)
    if (!device.ospfTimers) {
      device.ospfTimers = {};
    }
    device.ospfTimers.processId = processId;

    // Initialize OSPF structures
    if (!device.ospfNeighbors) {
      device.ospfNeighbors = [];
    }
    if (!device.ospfLsdb) {
      device.ospfLsdb = [];
    }

    output.push(`switch(config-ospf-${processId})#`);
    output.push('OSPF process started.');

    return this.createOutput(output, device);
  }
}

/**
 * Configure OSPF network statement
 * Syntax: network <prefix/mask> area <area-id>
 */
export class ArubaOspfNetworkCommand extends Command {
  readonly name = 'network';
  readonly description = 'Configure OSPF network (Aruba CX)';
  readonly vendor = 'aruba';
  readonly requiredView = ['system-view'];

  canHandle(context: CommandContext): boolean {
    if (context.profile.id !== 'aruba') {
      return false;
    }
    const { args, normalizedCommand } = context;
    // Must have OSPF enabled and be configuring network for OSPF
    return (
      args[0]?.toLowerCase() === 'network' &&
      normalizedCommand.toLowerCase().includes('area')
    );
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    const { args, device } = context;

    if (!device.ospfEnabled) {
      return {
        valid: false,
        error: 'Error: OSPF not enabled. Use "router ospf <id>" first.'
      };
    }

    // network <prefix/mask> area <area-id>
    if (args.length < 4 || args[2]?.toLowerCase() !== 'area') {
      return {
        valid: false,
        error: 'Error: Usage: network <prefix/mask> area <area-id>'
      };
    }

    const cidr = args[1];
    if (!cidr.includes('/')) {
      return {
        valid: false,
        error: 'Error: Network must be in CIDR notation (e.g., 10.0.0.0/24)'
      };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];

    const cidr = args[1];
    const [network, maskStr] = cidr.split('/');
    const mask = parseInt(maskStr, 10);
    const areaId = args[3];

    // Store network statement in LSDB (simplified)
    if (!device.ospfLsdb) {
      device.ospfLsdb = [];
    }

    device.ospfLsdb.push({
      type: 'network',
      network,
      mask,
      area: areaId,
      advertisedBy: device.hostname
    });

    output.push(`Network ${network}/${mask} added to OSPF area ${areaId}.`);

    return this.createOutput(output, device);
  }
}

/**
 * Configure OSPF router-id
 * Syntax: router-id <ip-address>
 */
export class ArubaOspfRouterIdCommand extends Command {
  readonly name = 'router-id';
  readonly description = 'Configure OSPF router ID (Aruba CX)';
  readonly vendor = 'aruba';
  readonly requiredView = ['system-view'];

  canHandle(context: CommandContext): boolean {
    if (context.profile.id !== 'aruba') {
      return false;
    }
    const { args } = context;
    return args[0]?.toLowerCase() === 'router-id';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    const { args, device } = context;

    if (!device.ospfEnabled) {
      return {
        valid: false,
        error: 'Error: OSPF not enabled. Use "router ospf <id>" first.'
      };
    }

    if (args.length < 2) {
      return {
        valid: false,
        error: 'Error: Usage: router-id <ip-address>'
      };
    }

    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(args[1])) {
      return {
        valid: false,
        error: 'Error: Invalid IP address format'
      };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];

    device.routerId = args[1];
    output.push(`Router ID set to ${args[1]}.`);

    return this.createOutput(output, device);
  }
}
