import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { validateAsNumber, validateCliView } from '../../validators/index.js';

export class BgpCommand extends Command {
    readonly name = 'bgp';
    readonly description = 'Configure BGP protocol';
    readonly requiredView = ['system-view'];

    canHandle(context: CommandContext): boolean {
        return context.args[0]?.toLowerCase() === 'bgp';
    }

    validate(context: CommandContext): { valid: boolean; error?: string } {
        const viewCheck = validateCliView(context.device, this.requiredView!);
        if (!viewCheck.valid) return viewCheck;

        if (context.args.length < 2) {
            return { valid: false, error: 'BGP command requires AS number' };
        }

        const asn = parseInt(context.args[1], 10);
        return validateAsNumber(asn);
    }

    execute(context: CommandContext): CommandResult {
        const { device, args } = context;
        const asn = parseInt(args[1], 10);

        if (!device.bgpConfig) {
            device.bgpConfig = {
                asNumber: asn,
                routerId: device.routerId || '0.0.0.0',
                neighbors: [],
                networks: [],
                enabled: true
            };
        } else {
            device.bgpConfig.asNumber = asn;
        }

        device.cliState.view = 'bgp-view';

        const output = [
            `[${device.hostname}-bgp]`,
        ];

        return this.createOutput(output, device);
    }
}
