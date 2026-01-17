/**
 * Help Command - Show available commands
 * Handles: ?, help
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { formatHelpLines } from '../../formatters.js';

export class HelpCommand extends Command {
    readonly name = '?';
    readonly description = 'Show available commands';
    readonly aliases = ['help'];

    canHandle(context: CommandContext): boolean {
        const cmd = context.normalizedCommand.toLowerCase();
        return cmd === '?' || cmd === 'help' || cmd === 'display ?' || cmd === 'display help';
    }

    execute(context: CommandContext): CommandResult {
        const { device, profile } = context;
        const output: string[] = [];

        // Use established help formatter
        const helpLines = formatHelpLines(profile, device.cliState.view);
        output.push(...helpLines);

        return this.createOutput(output, device);
    }
}
