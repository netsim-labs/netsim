/**
 * Display Eth-Trunk Command - Show Eth-Trunk information
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { NetworkPort } from '../../../../../types/NetworkTypes.js';

export class DisplayEthTrunkCommand extends Command {
    readonly name = 'display eth-trunk';
    readonly description = 'Display Eth-Trunk information';
    readonly aliases = ['dis eth-trunk'];
    readonly vendor = 'huawei';

    canHandle(context: CommandContext): boolean {
        const cmd = context.normalizedCommand.toLowerCase();
        return cmd === 'display eth-trunk' || cmd === 'dis eth-trunk';
    }

    execute(context: CommandContext): CommandResult {
        const { device } = context;
        const output: string[] = [];

        const trunks = device.ethTrunks || [];
        if (!trunks.length) {
            output.push('No Eth-Trunk configured.');
        } else {
            trunks.forEach(t => {
                const state = (t.enabled && t.actorState !== 'down') ? 'UP' : 'DOWN';
                output.push(`${t.name}  Mode:${t.mode ?? 'static'}  State:${state}`);
                output.push('Actor PortName   Status   PortType   PortPri   PortKey');
                t.members.forEach(pid => {
                    const p = device.ports.find((x: NetworkPort) => x.id === pid);
                    if (p) {
                        const isUp = p.status === 'up' && state === 'UP';
                        output.push(`${p.name.padEnd(14)} ${isUp ? 'Selected' : 'Unselect'} ${p.type.padEnd(8)}  32768     1`);
                    }
                });
                output.push('');
            });
        }

        return this.createOutput(output, device);
    }
}
