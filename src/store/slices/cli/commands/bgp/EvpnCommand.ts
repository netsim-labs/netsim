import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class EvpnCommand extends Command {
    readonly name = 'evpn';
    readonly description = 'Enable EVPN address family in BGP';
    readonly requiredView = ['bgp-view'];

    canHandle(context: CommandContext): boolean {
        const cmd = context.args[0]?.toLowerCase();
        return cmd === 'evpn';
    }

    validate(context: CommandContext): { valid: boolean; error?: string } {
        if (context.args.length < 1) {
            return { valid: false, error: 'Usage: evpn' };
        }
        return { valid: true };
    }

    execute(context: CommandContext): CommandResult {
        const { device } = context;

        if (!device.bgpConfig) {
            return this.createError('BGP is not initialized');
        }

        device.bgpConfig.evpnEnabled = true;

        return this.createOutput(['Info: EVPN address family enabled'], device);
    }
}
