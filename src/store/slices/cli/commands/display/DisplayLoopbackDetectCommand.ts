/**
 * Display Loopback-detect Command - Show loopback detection status
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { NetworkPort } from '../../../../../types/NetworkTypes.js';

export class DisplayLoopbackDetectCommand extends Command {
    readonly name = 'display loopback-detect';
    readonly description = 'Display loopback detection status';
    readonly aliases = ['dis loopback-detect'];
    readonly vendor = 'huawei';

    canHandle(context: CommandContext): boolean {
        const cmd = context.normalizedCommand.toLowerCase();
        return cmd.startsWith('display loopback-detect') || cmd.startsWith('dis loopback-detect');
    }

    execute(context: CommandContext): CommandResult {
        const { device, args } = context;
        const output: string[] = [];

        const ifaceRaw = args[1] && args[1] !== 'brief' ? args[1] : (args[2] && args[2] !== 'brief' ? args[2] : '');
        const iface = ifaceRaw ? ifaceRaw.replace(/\[|\]/g, '') : '';

        const ports = device.ports.filter((p: NetworkPort) => p.config.loopDetectEnabled);
        output.push('Port              Enabled Action     State    LastEvent');

        const list = iface
            ? ports.filter((p: NetworkPort) => p.name.toLowerCase() === iface.toLowerCase())
            : ports;

        if (!list.length) {
            output.push('No entries.');
        } else {
            list.forEach((p: NetworkPort) => {
                const state = p.loopDetected ? 'LOOP' : 'OK';
                const last = p.loopLastEvent ? new Date(p.loopLastEvent).toLocaleTimeString() : '-';
                output.push(`${p.name.padEnd(17)} yes     ${(p.config.loopDetectAction || 'log').padEnd(9)} ${state.padEnd(7)} ${last}`);
            });
        }

        return this.createOutput(output, device);
    }
}
