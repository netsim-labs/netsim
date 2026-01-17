
import { Command, CommandContext, CommandResult } from '../base/Command.js';

/**
 * snetconf server enable - Enable NETCONF service
 */
export class NetconfCommand extends Command {
    readonly name = 'snetconf server enable';
    readonly description = 'Enable NETCONF server service';
    readonly requiredView = ['system-view'];

    canHandle(context: CommandContext): boolean {
        return context.normalizedCommand === 'snetconf server enable' ||
            context.normalizedCommand === 'undo snetconf server enable';
    }

    execute(context: CommandContext): CommandResult {
        const isUndo = context.normalizedCommand.startsWith('undo');
        const device = context.device;

        const newDevice = {
            ...device,
            netconfEnabled: !isUndo,
            netconfConfig: {
                port: 830,
                sshEnabled: true
            }
        };

        return this.createOutput(
            [isUndo ? 'NETCONF server disabled.' : 'NETCONF server enabled (Port: 830).'],
            newDevice
        );
    }
}

/**
 * display snetconf server status - Show NETCONF status
 */
export class DisplayNetconfStatusCommand extends Command {
    readonly name = 'display snetconf server status';
    readonly description = 'Display NETCONF server status';

    canHandle(context: CommandContext): boolean {
        return context.normalizedCommand === 'display snetconf server status';
    }

    execute(context: CommandContext): CommandResult {
        const device = context.device;
        const enabled = device.netconfEnabled;

        const lines = [
            'NETCONF Server Information',
            '---------------------------------------',
            `  Server Status: ${enabled ? 'Enabled' : 'Disabled'}`,
            `  Listening Port: ${device.netconfConfig?.port || 830}`,
            `  SSH Support: ${device.netconfConfig?.sshEnabled ? 'Yes' : 'No'}`,
            `  Active Sessions: 0`,
            '---------------------------------------'
        ];

        return this.createOutput(lines);
    }
}
