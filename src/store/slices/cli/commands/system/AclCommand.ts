/**
 * ACL Commands - Configure Access Control Lists
 * Handles: acl rule add/delete
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

import { AclRule } from '../../../../../types/NetworkTypes.js';

export class AclRuleAddCommand extends Command {
  readonly name = 'acl rule add';
  readonly description = 'Add ACL rule';

  canHandle(context: CommandContext): boolean {
    const { args } = context;
    return (
      args[0]?.toLowerCase() === 'acl' &&
      args[1]?.toLowerCase() === 'rule' &&
      args[2]?.toLowerCase() === 'add'
    );
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    if (context.args.length < 7) {
      return {
        valid: false,
        error: 'Error: correct usage acl rule add <name> <permit|deny> <interface> <in|out> [src=<cidr>] [dst=<cidr>]'
      };
    }

    const ap = context.args[4]?.toLowerCase();
    const direction = context.args[6]?.toLowerCase();

    if (ap !== 'permit' && ap !== 'deny') {
      return { valid: false, error: 'Error: Action must be permit or deny.' };
    }

    if (direction !== 'in' && direction !== 'out') {
      return { valid: false, error: 'Error: Direction must be in or out.' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args, utils } = context;
    const output: string[] = [];

    const name = args[3];
    const ap = args[4].toLowerCase() as 'permit' | 'deny';
    const iface = args[5];
    const direction = args[6].toLowerCase() as 'in' | 'out';

    device.aclRules = device.aclRules || [];

    // Check for existing rule with same name
    const existing = device.aclRules.find(r => r.name === name);
    if (existing) {
      return this.createError('A rule with that name already exists.');
    }

    // Parse optional parameters
    const extras = args.slice(7);
    const rule: AclRule = {
      id: utils.generateUUID(),
      name,
      action: ap,
      protocol: 'any',
      source: 'any',
      destination: 'any',
      interfaceId: iface,
      direction,
      hits: 0
    };

    extras.forEach(opt => {
      const [rawKey, ...rest] = opt.split('=');
      if (!rawKey) return;
      const key = rawKey.toLowerCase();
      const value = rest.join('=');
      if (!value) return;

      if (key === 'src') rule.srcCidr = value;
      else if (key === 'dst') rule.dstCidr = value;
      else if (key === 'protocol') rule.protocol = value.toLowerCase() as 'tcp' | 'udp' | 'icmp' | 'any';
      else if (key === 'srcport') {
        const parsed = Number.parseInt(value, 10);
        if (!Number.isNaN(parsed)) rule.srcPort = parsed;
      } else if (key === 'dstport') {
        const parsed = Number.parseInt(value, 10);
        if (!Number.isNaN(parsed)) rule.dstPort = parsed;
      }
    });

    device.aclRules = [...device.aclRules, rule];
    output.push(`Info: ACL rule ${name} ${ap} added on ${iface} (${direction}).`);

    return this.createOutput(output, device);
  }
}

export class AclRuleDeleteCommand extends Command {
  readonly name = 'acl rule delete';
  readonly description = 'Delete ACL rule';

  canHandle(context: CommandContext): boolean {
    const { args } = context;
    return (
      args[0]?.toLowerCase() === 'acl' &&
      args[1]?.toLowerCase() === 'rule' &&
      args[2]?.toLowerCase() === 'delete'
    );
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    if (!context.args[3]) {
      return { valid: false, error: 'Error: acl rule delete <name>' };
    }
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];
    const name = args[3];

    const before = device.aclRules?.length || 0;
    device.aclRules = (device.aclRules || []).filter(r => r.name !== name && r.id !== name);

    if ((device.aclRules?.length || 0) === before) {
      return this.createError('Rule not found.');
    }

    output.push(`Info: ACL rule ${name} deleted.`);
    return this.createOutput(output, device);
  }
}
