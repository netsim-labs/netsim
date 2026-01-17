/**
 * Display LLDP Command - Show LLDP neighbor information
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class DisplayLldpCommand extends Command {
    readonly name = 'display lldp neighbor brief';
    readonly description = 'Display LLDP neighbor information';
    readonly aliases = ['dis lldp nei bri', 'dis lldp neighbor brief'];
    readonly vendor = 'huawei';

    canHandle(context: CommandContext): boolean {
        const cmd = context.normalizedCommand.toLowerCase();
        return cmd === 'display lldp neighbor brief' ||
            cmd === 'dis lldp nei bri' ||
            cmd === 'dis lldp neighbor brief';
    }

    execute(context: CommandContext): CommandResult {
        const { device } = context;
        const output: string[] = [];

        const neigh = device.lldpNeighbors || [];
        if (!neigh.length) {
            output.push('No LLDP neighbors.');
        } else {
            output.push('LocalPort  RemoteDevice        RemotePort    Caps      ChassisId');
            neigh.forEach(n => {
                output.push(`${n.localPort.padEnd(10)} ${n.remoteDevice.padEnd(18)} ${n.remotePort.padEnd(12)} ${n.capabilities.padEnd(9)} ${n.chassisId}`);
            });
        }

        return this.createOutput(output, device);
    }
}
