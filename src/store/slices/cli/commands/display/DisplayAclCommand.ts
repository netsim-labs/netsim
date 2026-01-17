/**
 * Display ACL Command - Show ACL rules
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class DisplayAclCommand extends Command {
  readonly name = 'display acl';
  readonly description = 'Display ACL rules';
  readonly aliases = ['dis acl'];
  readonly vendor = 'huawei';

  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd === 'display acl' || cmd === 'dis acl';
  }

  validate(_context: CommandContext): { valid: boolean; error?: string } {
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device } = context;
    const output: string[] = [];

    const rules = device.aclRules || [];

    if (!rules.length) {
      output.push('No ACL rules.');
    } else {
      output.push('Name           Action  Dir  Interface   Proto  Src           Dst           SrcPort DstPort Hits');
      rules.forEach(rule => {
      const protoLabel = (rule.protocol || 'any').toUpperCase();
      const srcPortLabel = rule.srcPort !== undefined ? rule.srcPort.toString() : '*';
      const dstPortLabel = rule.dstPort !== undefined ? rule.dstPort.toString() : '*';
      const directionLabel = (rule.direction || 'in').padEnd(4);

      output.push(
        `${(rule.name || rule.id).padEnd(15)} ` +
        `${rule.action.padEnd(7)} ` +
        `${directionLabel} ` +
        `${(rule.interfaceId || '*').padEnd(11)} ` +
        `${protoLabel.padEnd(6)} ` +
        `${(rule.srcCidr || 'any').padEnd(14)} ` +
        `${(rule.dstCidr || 'any').padEnd(14)} ` +
        `${srcPortLabel.padEnd(8)} ` +
        `${dstPortLabel.padEnd(8)} ` +
        `${(rule.hits || 0).toString().padEnd(4)}`
      );
      });
    }

    return this.createOutput(output, device);
  }
}
