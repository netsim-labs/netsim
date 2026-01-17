/**
 * Display OSPF LSDB Command - Show OSPF Link State Database
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class DisplayOspfLsdbCommand extends Command {
  readonly name = 'display ospf lsdb';
  readonly description = 'Display OSPF Link State Database';
  readonly aliases = ['dis ospf lsdb'];
  readonly vendor = 'huawei';

  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd === 'display ospf lsdb' || cmd === 'dis ospf lsdb';
  }

  validate(_context: CommandContext): { valid: boolean; error?: string } {
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device } = context;
    const output: string[] = [];

    const lsdb = device.ospfLsdb || [];

    if (!lsdb.length) {
      output.push('No OSPF LSDB entries.');
    } else {
      output.push('Neighbor     Interface    Network/Mask    Cost');
      lsdb.forEach(entry => {
        const neighborId = (entry.neighborId || 'N/A').padEnd(13);
        const iface = entry.interface.padEnd(12);
        const networkMask = `${entry.network.padEnd(15)}/${entry.mask.toString().padEnd(2)}`;

        output.push(`${neighborId} ${iface} ${networkMask} ${entry.cost}`);
      });
    }

    return this.createOutput(output, device);
  }
}
