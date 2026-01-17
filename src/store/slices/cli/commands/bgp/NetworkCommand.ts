import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { validateCliView } from '../../validators/index.js';

export class NetworkCommand extends Command {
    readonly name = 'network';
    readonly description = 'Advertise network in BGP';
    readonly requiredView = ['bgp-view'];

    canHandle(context: CommandContext): boolean {
        return context.args[0]?.toLowerCase() === 'network';
    }

    validate(context: CommandContext): { valid: boolean; error?: string } {
        const viewCheck = validateCliView(context.device, this.requiredView!);
        if (!viewCheck.valid) return viewCheck;

        if (context.args.length < 2) {
            return { valid: false, error: 'Usage: network <ip> [<mask>]' };
        }

        return { valid: true };
    }

    execute(context: CommandContext): CommandResult {
        const { device, args } = context;
        const net = args[1];
        const mask = args[2] || '24';
        const cidr = `${net}/${mask}`;

        if (!device.bgpConfig) {
            return this.createError('BGP is not initialized');
        }

        if (!device.bgpConfig.networks.includes(cidr)) {
            device.bgpConfig.networks.push(cidr);
        }

        return this.createOutput([`Network ${cidr} added to BGP`], device);
    }
}
