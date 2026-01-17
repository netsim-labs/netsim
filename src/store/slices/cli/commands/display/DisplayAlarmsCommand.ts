/**
 * Display Alarms Command - Show system alarms
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class DisplayAlarmsCommand extends Command {
    readonly name = 'display alarms';
    readonly description = 'Display recent system alarms';
    readonly aliases = ['dis alarm', 'dis alarms', 'show alarms'];
    readonly vendor = null;

    canHandle(context: CommandContext): boolean {
        const cmd = context.normalizedCommand.toLowerCase();
        return cmd === 'display alarms' ||
            cmd === 'display alarm' ||
            cmd === 'dis alarm' ||
            cmd === 'dis alarms' ||
            cmd === 'show alarms';
    }

    execute(context: CommandContext): CommandResult {
        const { device } = context;
        const output: string[] = [];

        const alarmLines = (device.consoleLogs || []).filter(l => l.includes('[ALARM]')).slice(-10);

        if (!alarmLines.length) {
            output.push('No alarms.');
        } else {
            output.push('Recent Alarms:');
            output.push(...alarmLines);
        }

        return this.createOutput(output, device);
    }
}
