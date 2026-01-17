import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class CommitCommand extends Command {
    readonly name = 'commit';
    readonly description = 'Commit candidate configuration to running configuration';
    readonly vendor = 'yunshan';

    execute(context: CommandContext): CommandResult {
        const { device } = context;
        if (!device.candidateState) {
            return this.createOutput(['Info: No candidate configuration to commit.']);
        }

        // Apply candidate state to main device state
        const newState = { ...device.candidateState };

        // Clear candidate state after commit
        delete newState.candidateState;

        // Maintain console logs (merge them)
        newState.consoleLogs = [...device.consoleLogs, 'Info: Configuration committed successfully.'];

        return {
            output: ['Info: Configuration committed successfully.'],
            device: newState
        };
    }
}

export class AbortCommand extends Command {
    readonly name = 'abort';
    readonly description = 'Discard candidate configuration';
    readonly vendor = 'yunshan';

    execute(context: CommandContext): CommandResult {
        const { device } = context;
        if (!device.candidateState) {
            return this.createOutput(['Info: No candidate configuration to abort.']);
        }

        const newState = { ...device };
        delete newState.candidateState;

        return {
            output: ['Info: Candidate configuration discarded.'],
            device: newState
        };
    }
}

export class DisplayCandidateCommand extends Command {
    readonly name = 'display candidate-configuration';
    readonly description = 'Display candidate configuration';
    readonly vendor = 'yunshan';

    execute(context: CommandContext): CommandResult {
        const { device } = context;
        if (!device.candidateState) {
            return this.createOutput(['Info: Candidate configuration is empty.']);
        }

        // Logic to show diff or just candidate state
        // For now, let's show a summary of what's different or just a message
        return this.createOutput([
            '# Candidate Configuration:',
            `hostname ${device.candidateState.hostname}`,
            ...device.candidateState.vlans.length > 0 ? [`vlan batch ${device.candidateState.vlans.join(' ')}`] : [],
            '# End of candidate configuration'
        ]);
    }
}

export class DisplayThisCommand extends Command {
    readonly name = 'display this';
    readonly description = 'Display configuration in current view';
    readonly vendor = 'yunshan';

    execute(context: CommandContext): CommandResult {
        const { device } = context;
        // For YunShan, 'display this' should show the candidate state if it exists,
        // otherwise the running state.
        const active = device.candidateState || device;
        const view = device.cliState.view;
        const output: string[] = [`# Configuration in ${view}`];

        if (view === 'system-view') {
            output.push(`sysname ${active.hostname}`);
            if (active.vlans.length > 0) {
                output.push(`vlan batch ${active.vlans.join(' ')}`);
            }
        } else if (view === 'interface-view') {
            const intId = device.cliState.currentInterfaceId;
            const port = active.ports.find((p: any) => p.name === intId || p.id === intId);
            if (port) {
                output.push(`interface ${port.name}`);
                if (port.config.description) output.push(` description ${port.config.description}`);
                if (port.config.ipAddress) output.push(` ip address ${port.config.ipAddress} ${port.config.netmask || '24'}`);
                if (port.config.mode) output.push(` port link-type ${port.config.mode}`);
                if (port.config.vlan) output.push(` port default vlan ${port.config.vlan}`);
            }
        }

        output.push('# return');
        return this.createOutput(output);
    }
}
