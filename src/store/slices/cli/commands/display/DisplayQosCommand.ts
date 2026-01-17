/**
 * Display Qos Command - Show Quality of Service configuration
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { NetworkPort, QosQueue } from '../../../../../types/NetworkTypes.js';

export class DisplayQosCommand extends Command {
    readonly name = 'display qos';
    readonly description = 'Display QoS configuration';
    readonly aliases = ['dis qos', 'show qos'];
    readonly vendor = null;

    canHandle(context: CommandContext): boolean {
        const cmd = context.normalizedCommand.toLowerCase();
        return cmd === 'display qos' || cmd === 'dis qos' || cmd === 'show qos';
    }

    execute(context: CommandContext): CommandResult {
        const { device } = context;
        const output: string[] = [];

        output.push('Interface         Limit   Shape   Queues');
        device.ports.forEach((p: NetworkPort) => {
            const qos = p.config.qos;
            const queues: QosQueue[] = qos?.queues ?? [];
            const hasQueueInfo = queues.length > 1 || (queues.length === 1 && queues[0].name !== 'default');

            if (!qos?.limitMbps && !qos?.shapePct && !hasQueueInfo) return;

            const limitLabel = qos?.limitMbps ? `${qos.limitMbps} Mbps` : '-';
            const shapeLabel = qos?.shapePct ? `${qos.shapePct}%` : '-';
            const queueLabel = (queues || []).map(q => `${q.name} (dscp ${q.dscp} w${q.weight})`).join(', ') || '-';

            output.push(`${p.name.padEnd(18)} ${limitLabel.padEnd(7)} ${shapeLabel.padEnd(7)} ${queueLabel}`);
        });

        if (output.length === 1) {
            output.push('No QoS configuration found.');
        }

        return this.createOutput(output, device);
    }
}
