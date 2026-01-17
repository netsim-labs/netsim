import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { validateIpAddress, validateCliView } from '../../validators/index.js';

export class RouterIdCommand extends Command {
    readonly name = 'router-id';
    readonly description = 'Set BGP Router ID';
    readonly requiredView = ['bgp-view'];

    canHandle(context: CommandContext): boolean {
        return context.args[0]?.toLowerCase() === 'router-id';
    }

    validate(context: CommandContext): { valid: boolean; error?: string } {
        const viewCheck = validateCliView(context.device, this.requiredView!);
        if (!viewCheck.valid) return viewCheck;

        if (context.args.length < 2) {
            return { valid: false, error: 'Usage: router-id <ip>' };
        }

        return validateIpAddress(context.args[1]);
    }

    execute(context: CommandContext): CommandResult {
        const { device, args } = context;
        const rid = args[1];

        if (!device.bgpConfig) {
            return this.createError('BGP is not initialized');
        }

        device.bgpConfig.routerId = rid;

        return this.createOutput([`BGP Router ID set to ${rid}`], device);
    }
}
