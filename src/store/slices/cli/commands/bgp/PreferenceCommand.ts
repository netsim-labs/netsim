import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { validateCliView } from '../../validators/index.js';

export class PreferenceCommand extends Command {
    readonly name = 'preference';
    readonly description = 'Set BGP preference / local-preference';
    readonly requiredView = ['bgp-view'];

    canHandle(context: CommandContext): boolean {
        return context.args[0]?.toLowerCase() === 'default' && context.args[1]?.toLowerCase() === 'local-preference';
    }

    validate(context: CommandContext): { valid: boolean; error?: string } {
        const viewCheck = validateCliView(context.device, this.requiredView!);
        if (!viewCheck.valid) return viewCheck;

        if (context.args.length < 3) {
            return { valid: false, error: 'Usage: default local-preference <value>' };
        }

        return { valid: true };
    }

    execute(context: CommandContext): CommandResult {
        const { device, args } = context;
        const val = parseInt(args[2], 10);

        if (!device.bgpConfig) {
            return this.createError('BGP is not initialized');
        }

        device.bgpConfig.defaultLocalPreference = val;

        return this.createOutput([`Default local preference set to ${val}`], device);
    }
}
