/**
 * Display ARP Command - Show ARP entries
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { NetworkPort } from '../../../../../types/NetworkTypes.js';

export class DisplayArpCommand extends Command {
    readonly name = 'display arp';
    readonly description = 'Display ARP entries';
    readonly aliases = ['dis arp', 'show arp'];
    readonly vendor = null; // Works on all vendors

    canHandle(context: CommandContext): boolean {
        const cmd = context.normalizedCommand.toLowerCase();
        return cmd === 'display arp' || cmd === 'dis arp' || cmd === 'show arp';
    }

    execute(context: CommandContext): CommandResult {
        const { device, devices, cables } = context;
        const output: string[] = [];

        output.push('IP Address       MAC Address        Interface');
        const entries: { ip: string; mac: string; iface: string }[] = [];

        cables.forEach((c) => {
            if (c.sourceDeviceId === device.id) {
                const peer = devices.find((d) => d.id === c.targetDeviceId);
                const ip = peer?.ports.find((p) => p.config.ipAddress)?.config.ipAddress;
                if (ip) {
                    const port = device.ports.find((p: NetworkPort) => p.id === c.sourcePortId);
                    entries.push({ ip, mac: peer?.macAddress || '-', iface: port?.name || '-' });
                }
            }
            if (c.targetDeviceId === device.id) {
                const peer = devices.find((d) => d.id === c.sourceDeviceId);
                const ip = peer?.ports.find((p) => p.config.ipAddress)?.config.ipAddress;
                if (ip) {
                    const port = device.ports.find((p: NetworkPort) => p.id === c.targetPortId);
                    entries.push({ ip, mac: peer?.macAddress || '-', iface: port?.name || '-' });
                }
            }
        });

        if (!entries.length) {
            output.push('No ARP entries.');
        } else {
            entries.forEach(e => output.push(`${e.ip.padEnd(16)} ${e.mac.padEnd(17)} ${e.iface}`));
        }

        return this.createOutput(output, device);
    }
}
