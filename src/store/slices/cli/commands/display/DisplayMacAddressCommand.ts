/**
 * Display MAC Address Command - Show MAC address table
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { NetworkPort } from '../../../../../types/NetworkTypes.js';

export class DisplayMacAddressCommand extends Command {
    readonly name = 'display mac-address';
    readonly description = 'Display MAC address entries';
    readonly aliases = ['dis mac-address', 'show mac-address-table', 'show mac address-table'];
    readonly vendor = null;

    canHandle(context: CommandContext): boolean {
        const cmd = context.normalizedCommand.toLowerCase();
        return cmd === 'display mac-address' ||
            cmd === 'dis mac-address' ||
            cmd === 'show mac-address-table' ||
            cmd === 'show mac address-table';
    }

    execute(context: CommandContext): CommandResult {
        const { device, devices, cables } = context;
        const output: string[] = [];

        output.push('MAC Address      VLAN   Interface');
        const seen = new Set<string>();

        cables.forEach((c) => {
            if (c.sourceDeviceId === device.id) {
                const peer = devices.find((d) => d.id === c.targetDeviceId);
                const mac = peer?.macAddress || '';
                if (mac && !seen.has(mac)) {
                    seen.add(mac);
                    const port = device.ports.find((p: NetworkPort) => p.id === c.sourcePortId);
                    output.push(`${mac.padEnd(16)} 1     ${port?.name || '-'}`);
                }
            }
            if (c.targetDeviceId === device.id) {
                const peer = devices.find((d) => d.id === c.sourceDeviceId);
                const mac = peer?.macAddress || '';
                if (mac && !seen.has(mac)) {
                    seen.add(mac);
                    const port = device.ports.find((p: NetworkPort) => p.id === c.targetPortId);
                    output.push(`${mac.padEnd(16)} 1     ${port?.name || '-'}`);
                }
            }
        });

        if (!seen.size) {
            output.push('No MAC entries.');
        }

        return this.createOutput(output, device);
    }
}
