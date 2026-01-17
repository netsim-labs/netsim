
/**
 * Display IP Interface Brief Command - Show interface IP info (Huawei)
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { formatCiscoIpInterfaceBrief } from '../../formatters.js';

export class DisplayIpInterfaceBriefCommand extends Command {
    readonly name = 'display ip interface brief';
    readonly description = 'Display interface IP address and status';
    readonly aliases = ['dis ip int br', 'dis ip int b', 'display ip int brief', 'display ip int b'];
    readonly vendor = 'huawei'; // Or generic

    canHandle(context: CommandContext): boolean {
        const cmd = context.normalizedCommand.toLowerCase();
        return (
            cmd === 'display ip interface brief' ||
            cmd === 'dis ip int br' ||
            cmd === 'dis ip int b' ||
            cmd === 'display ip int brief' ||
            cmd === 'display ip int b'
        );
    }

    validate(_context: CommandContext): { valid: boolean; error?: string } {
        return { valid: true };
    }

    execute(context: CommandContext): CommandResult {
        // We can reuse the Cisco formatter as it provides the necessary columns (IP, Status, Protocol)
        // In the future, we can implement a specific formatHuaweiIpInterfaceBrief if the visual style needs to match 100%
        const output = formatCiscoIpInterfaceBrief(context.device);

        // Replace header for Huawei consistency if needed, but the generic one is usually fine.
        // Huawei usually: Interface IP Address/Mask Physical Protocol VPN ...
        // The cisco formatter: Interface IP-Address OK? Method Status Protocol
        // Let's stick to the reusable one for now to ensure functionality.

        return this.createOutput(output, context.device);
    }
}
