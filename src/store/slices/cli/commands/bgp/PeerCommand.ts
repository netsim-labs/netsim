import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { validateIpAddress, validateCliView } from '../../validators/index.js';

export class PeerCommand extends Command {
    readonly name = 'peer';
    readonly description = 'Configure BGP peer';
    readonly requiredView = ['bgp-view'];

    canHandle(context: CommandContext): boolean {
        return context.args[0]?.toLowerCase() === 'peer';
    }

    validate(context: CommandContext): { valid: boolean; error?: string } {
        const viewCheck = validateCliView(context.device, this.requiredView!);
        if (!viewCheck.valid) return viewCheck;

        const { args } = context;
        if (args.length < 2) {
            return { valid: false, error: 'Usage: peer <ip> <as-number | reflect-client | next-hop-local>' };
        }

        const ipCheck = validateIpAddress(args[1]);
        if (!ipCheck.valid) return ipCheck;

        return { valid: true };
    }

    execute(context: CommandContext): CommandResult {
        const { device, args } = context;
        const peerIp = args[1];

        if (!device.bgpConfig) {
            return this.createError('BGP is not initialized');
        }

        let neighbor = device.bgpConfig.neighbors.find(n => n.ip === peerIp);
        if (!neighbor && args[2]?.toLowerCase() === 'as-number') {
            neighbor = {
                ip: peerIp,
                remoteAs: parseInt(args[3], 10),
                state: 'Idle'
            };
            device.bgpConfig.neighbors.push(neighbor);
        }

        if (!neighbor) {
            return this.createError(`Neighbor ${peerIp} not found. Configure AS number first.`);
        }

        const subCommand = args[2]?.toLowerCase();
        let message = '';

        switch (subCommand) {
            case 'as-number':
                neighbor.remoteAs = parseInt(args[3], 10);
                message = `Neighbor ${peerIp} AS set to ${neighbor.remoteAs}`;
                break;
            case 'reflect-client':
                neighbor.isClient = true;
                message = `Neighbor ${peerIp} configured as route-reflector client`;
                break;
            case 'next-hop-local': // Huawei
            case 'next-hop-self':  // Cisco
                neighbor.nextHopSelf = true;
                message = `Neighbor ${peerIp} next-hop-self enabled`;
                break;
            case 'description':
                neighbor.description = args.slice(3).join(' ');
                message = `Neighbor ${peerIp} description updated`;
                break;
            default:
                return this.createError('Usage: peer <ip> <as-number | reflect-client | next-hop-local | description>');
        }

        return this.createOutput([message], device);
    }
}
