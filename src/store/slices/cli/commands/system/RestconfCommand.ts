import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class RestconfCommand extends Command {
    readonly name = 'restconf';
    readonly description = 'Enable RESTCONF service';
    readonly requiredView = ['system-view']; // Huawei default

    canHandle(context: CommandContext): boolean {
        // Handle "restconf enable" or just "restconf" for some platforms
        // Also handling undo in separate class or here logic? Let's use separate if pure name matching fails.
        // Normalized command usually strips spaces.
        const cmd = context.normalizedCommand;
        return cmd === 'restconf' || cmd === 'restconf enable' || cmd === 'ip http secure-server';
    }

    execute(context: CommandContext): CommandResult {
        const device = context.device;

        // Default config
        const config = device.restconfConfig || {
            port: 443,
            secure: true,
            rootPath: '/restconf'
        };

        const newDevice = {
            ...device,
            restconfEnabled: true,
            restconfConfig: config
        };

        return this.createOutput(
            ['RESTCONF service enabled (Port: 443).'],
            newDevice
        );
    }
}

export class UndoRestconfCommand extends Command {
    readonly name = 'undo restconf';
    readonly description = 'Disable RESTCONF service';

    canHandle(context: CommandContext): boolean {
        const cmd = context.normalizedCommand;
        return cmd === 'undo restconf' || cmd === 'no restconf' || cmd === 'no ip http secure-server';
    }

    execute(context: CommandContext): CommandResult {
        const device = context.device;

        const newDevice = {
            ...device,
            restconfEnabled: false
        };

        return this.createOutput(
            ['RESTCONF service disabled.'],
            newDevice
        );
    }
}

export class DisplayRestconfCommand extends Command {
    readonly name = 'display restconf';
    readonly description = 'Display RESTCONF status';

    canHandle(context: CommandContext): boolean {
        return context.normalizedCommand === 'display restconf' ||
            context.normalizedCommand === 'show restconf' ||
            context.normalizedCommand === 'show ip http server secure status';
    }

    execute(context: CommandContext): CommandResult {
        const device = context.device;
        const enabled = !!device.restconfEnabled;
        const config = device.restconfConfig || { port: 443, secure: true, rootPath: '/restconf' };

        const output = device.vendor === 'Cisco' ? [
            'HTTP Secure Server Status:',
            `  Status: ${enabled ? 'Enabled' : 'Disabled'}`,
            `  Port: ${config.port}`,
            `  Root Path: ${config.rootPath}`
        ] : [
            'RESTCONF Service Information',
            '---------------------------------------',
            `  Status:        ${enabled ? 'Enable' : 'Disable'}`,
            `  Listen Port:   ${config.port}`,
            `  Secure:        ${config.secure ? 'Yes' : 'No'}`,
            `  Root URI:      ${config.rootPath}`,
            '---------------------------------------'
        ];

        return this.createOutput(output);
    }
}
