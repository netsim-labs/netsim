/**
 * Display IP Routing Table Command - Show routing table
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class DisplayIpRoutingTableCommand extends Command {
  readonly name = 'display ip routing-table';
  readonly description = 'Display IP routing table';
  readonly aliases = ['dis ip routing-table', 'dis ip route'];
  readonly vendor = 'huawei';

  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();
    return (
      cmd === 'display ip routing-table' ||
      cmd === 'dis ip routing-table' ||
      cmd === 'dis ip route'
    );
  }

  validate(_context: CommandContext): { valid: boolean; error?: string } {
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device } = context;
    const output: string[] = [];

    const routingTable = device.routingTable || [];

    output.push('Destination/Mask    Proto   Pre  Cost      NextHop         Interface');

    routingTable.forEach(r => {
      const dest = `${r.destination}/${r.mask}`;
      output.push(
        `${dest.padEnd(20)} ` +
        `${r.proto.padEnd(7)} ` +
        `${r.pre.toString().padEnd(4)} ` +
        `${r.cost.toString().padEnd(9)} ` +
        `${r.nextHop.padEnd(15)} ` +
        `${r.interface}`
      );
    });

    if (!routingTable.length) {
      output.push('No routing entries.');
    }

    return this.createOutput(output, device);
  }
}
