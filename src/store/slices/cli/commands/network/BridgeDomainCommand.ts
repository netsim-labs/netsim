import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { validateCliView } from '../../validators/index.js';

export class BridgeDomainCommand extends Command {
    readonly name = 'bridge-domain';
    readonly description = 'Create and enter Bridge Domain view';
    readonly requiredView = ['system-view'];

    canHandle(context: CommandContext): boolean {
        return context.args[0]?.toLowerCase() === 'bridge-domain';
    }

    validate(context: CommandContext): { valid: boolean; error?: string } {
        const viewCheck = validateCliView(context.device, this.requiredView!);
        if (!viewCheck.valid) return viewCheck;

        if (context.args.length < 2) {
            return { valid: false, error: 'Usage: bridge-domain <id>' };
        }

        const id = parseInt(context.args[1], 10);
        if (isNaN(id) || id < 1 || id > 16777215) {
            return { valid: false, error: 'Invalid BD ID (1-16777215)' };
        }

        return { valid: true };
    }

    execute(context: CommandContext): CommandResult {
        const { device, args } = context;
        const id = parseInt(args[1], 10);

        if (!device.bridgeDomains) device.bridgeDomains = [];

        let bd = device.bridgeDomains.find(b => b.id === id);
        if (!bd) {
            bd = { id };
            device.bridgeDomains.push(bd);
        }

        device.cliState.view = 'interface-view'; // We'll reuse interface-view for BD
        (device.cliState as any).currentBdId = id;

        return this.createOutput([`[${device.hostname}-bd${id}]`], device);
    }
}
