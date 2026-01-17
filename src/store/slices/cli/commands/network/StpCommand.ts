/**
 * STP Command - Configure Spanning Tree Protocol
 * Handles: stp enable, stp mode {stp|rstp|mstp}, stp root {primary|secondary}
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class StpCommand extends Command {
    readonly name = 'stp';
    readonly description = 'Configure Spanning Tree Protocol';
    readonly requiredView = ['system-view'];

    canHandle(context: CommandContext): boolean {
        const cmd = context.normalizedCommand.toLowerCase();
        return cmd.startsWith('stp');
    }

    validate(context: CommandContext): { valid: boolean; error?: string } {
        const viewCheck = super.validate(context);
        if (!viewCheck.valid) {
            return viewCheck;
        }

        const { args } = context;
        if (args.length < 2) {
            return { valid: false, error: 'Error: Incomplete command. Usage: stp [mode|enable|disable|root]' };
        }

        const sub = args[1]?.toLowerCase();
        if (sub === 'mode') {
            const mode = args[2]?.toLowerCase();
            if (!mode || !['stp', 'rstp', 'mstp'].includes(mode)) {
                return { valid: false, error: 'Error: usage stp mode {stp|rstp|mstp}' };
            }
        }

        return { valid: true };
    }

    execute(context: CommandContext): CommandResult {
        const { device, args } = context;
        const output: string[] = [];
        const sub = args[1]?.toLowerCase();

        if (sub === 'enable') {
            device.stpEnabled = true;
            output.push('Info: Global STP enabled.');
        } else if (sub === 'disable') {
            device.stpEnabled = false;
            output.push('Info: Global STP disabled.');
        } else if (sub === 'mode') {
            const mode = args[2]?.toLowerCase() as 'stp' | 'rstp' | 'mstp';
            device.stpMode = mode;
            output.push(`Info: STP mode set to ${mode.toUpperCase()}.`);
        } else if (sub === 'root') {
            const role = args[2]?.toLowerCase();
            if (role === 'primary') {
                device.stpPriority = 0;
                output.push('Info: Device set as Root Primary (Priority 0).');
            } else if (role === 'secondary') {
                device.stpPriority = 4096;
                output.push('Info: Device set as Root Secondary (Priority 4096).');
            } else {
                output.push('Error: stp root {primary|secondary}');
            }
        } else {
            output.push('Error: Unknown STP command.');
        }

        return this.createOutput(output, device);
    }
}
