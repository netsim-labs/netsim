/**
 * NAT Commands - Configure Network Address Translation
 * Handles: nat show, nat static add, nat dynamic add, nat rule delete
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class NatShowCommand extends Command {
  readonly name = 'nat show';
  readonly description = 'Show NAT rules';

  canHandle(context: CommandContext): boolean {
    const { args } = context;
    return args[0]?.toLowerCase() === 'nat' && args[1]?.toLowerCase() === 'show';
  }

  execute(context: CommandContext): CommandResult {
    const { device } = context;
    const output: string[] = [];
    const rules = device.natRules || [];

    if (!rules.length) {
      output.push('No NAT rules.');
    } else {
      output.push('ID   Type     Private             Public             Interface   PAT');
      rules.forEach(r => {
        output.push(
          `${r.id.slice(0, 6).padEnd(6)} ${r.type.padEnd(8)} ${(r.privateIp || '*').padEnd(19)} ${(r.publicIp || '*').padEnd(19)} ${(r.interfaceId || 'any').padEnd(11)} ${r.pat ? 'yes' : 'no'}`
        );
      });
    }

    return this.createOutput(output, device);
  }
}

export class NatStaticAddCommand extends Command {
  readonly name = 'nat static add';
  readonly description = 'Add static NAT rule';

  canHandle(context: CommandContext): boolean {
    const { args } = context;
    return (
      args[0]?.toLowerCase() === 'nat' &&
      args[1]?.toLowerCase() === 'static' &&
      args[2]?.toLowerCase() === 'add'
    );
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    if (!context.args[3] || !context.args[4]) {
      return { valid: false, error: 'Error: nat static add <private-ip> <public-ip> [interface <name>]' };
    }
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args, utils } = context;
    const output: string[] = [];

    const privateIp = args[3];
    const publicIp = args[4];
    const ifaceIdx = args.indexOf('interface');
    const iface = ifaceIdx !== -1 && args[ifaceIdx + 1] ? args[ifaceIdx + 1] : undefined;

    device.natRules = device.natRules || [];

    // Check for existing rule
    const existing = device.natRules.find(
      r => r.privateIp === privateIp && r.publicIp === publicIp
    );
    if (existing) {
      return this.createError('NAT rule already exists.');
    }

    // Check for public IP collision
    const publicIpCollision = device.natRules.find(
      r => r.type === 'static' && r.publicIp === publicIp && r.privateIp !== privateIp
    );
    if (publicIpCollision) {
      return this.createError(
        `Public IP ${publicIp} is already mapped to ${publicIpCollision.privateIp}. Remove existing rule first.`
      );
    }

    const rule: any = {
      id: utils.generateUUID(),
      type: 'static',
      privateIp,
      publicIp
    };
    if (iface) rule.interfaceId = iface;

    device.natRules = [...device.natRules, rule];
    output.push(`Info: NAT static ${privateIp} -> ${publicIp} added.`);

    return this.createOutput(output, device);
  }
}

export class NatDynamicAddCommand extends Command {
  readonly name = 'nat dynamic add';
  readonly description = 'Add dynamic NAT rule';

  canHandle(context: CommandContext): boolean {
    const { args } = context;
    return (
      args[0]?.toLowerCase() === 'nat' &&
      args[1]?.toLowerCase() === 'dynamic' &&
      args[2]?.toLowerCase() === 'add'
    );
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    if (!context.args[3]) {
      return { valid: false, error: 'Error: nat dynamic add <public-ip> [interface <name>] [pat]' };
    }
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args, utils } = context;
    const output: string[] = [];

    const publicIp = args[3];
    const ifaceIdx = args.indexOf('interface');
    const iface = ifaceIdx !== -1 && args[ifaceIdx + 1] ? args[ifaceIdx + 1] : undefined;
    const pat = args.map(a => a.toLowerCase()).includes('pat');

    device.natRules = device.natRules || [];

    // Check for static collision
    const staticCollision = device.natRules.find(
      r => r.type === 'static' && r.publicIp === publicIp
    );
    if (staticCollision && !pat) {
      return this.createError(
        `Public IP ${publicIp} is already used by static NAT rule. Use PAT or different IP.`
      );
    }

    const rule: any = {
      id: utils.generateUUID(),
      type: 'dynamic',
      publicIp,
      pat
    };
    if (iface) rule.interfaceId = iface;
    if (pat) rule.publicPort = 50000;

    device.natRules = [...device.natRules, rule];
    output.push(`Info: NAT dynamic ${publicIp}${pat ? ' (PAT)' : ''} added.`);

    return this.createOutput(output, device);
  }
}

export class NatRuleDeleteCommand extends Command {
  readonly name = 'nat rule delete';
  readonly description = 'Delete NAT rule';

  canHandle(context: CommandContext): boolean {
    const { args } = context;
    return (
      args[0]?.toLowerCase() === 'nat' &&
      args[1]?.toLowerCase() === 'rule' &&
      args[2]?.toLowerCase() === 'delete'
    );
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    if (!context.args[3]) {
      return { valid: false, error: 'Error: nat rule delete <id|private-ip>' };
    }
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];
    const key = args[3];

    const before = device.natRules?.length || 0;
    device.natRules = (device.natRules || []).filter(
      r => !r.id.startsWith(key) && r.privateIp !== key
    );

    if ((device.natRules?.length || 0) === before) {
      return this.createError('NAT rule not found.');
    }

    output.push('Info: NAT rule deleted.');
    return this.createOutput(output, device);
  }
}
