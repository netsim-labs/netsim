import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { validateCliView } from '../../validators/index.js';

export class DisplayBgpCommand extends Command {
    readonly name = 'display-bgp';
    readonly description = 'Display BGP information';
    readonly requiredView = ['user-view', 'system-view', 'bgp-view'];

    canHandle(context: CommandContext): boolean {
        const cmd = context.args[0]?.toLowerCase();
        return cmd === 'display' && context.args[1]?.toLowerCase() === 'bgp';
    }

    validate(context: CommandContext): { valid: boolean; error?: string } {
        return validateCliView(context.device, this.requiredView!);
    }

    execute(context: CommandContext): CommandResult {
        const { device, args } = context;
        const subCommand = args[2]?.toLowerCase();

        if (!device.bgpConfig) {
            return this.createOutput(['BGP not configured'], device);
        }

        if (subCommand === 'peer') {
            const output = [
                'BGP local router ID : ' + (device.bgpConfig.routerId || '0.0.0.0'),
                'Local AS number : ' + device.bgpConfig.asNumber,
                '',
                ' Total number of peers : ' + device.bgpConfig.neighbors.length,
                ' Peers established : ' + device.bgpConfig.neighbors.filter(n => n.state === 'Established').length,
                '',
                ' Peer            AS  MsgRcvd  MsgSent  OutQ  Up/Down       State Status',
                device.bgpConfig.neighbors.map(n => {
                    const ip = n.ip.padEnd(15);
                    const as = n.remoteAs.toString().padEnd(5);
                    const state = n.state.padEnd(12);
                    return ` ${ip} ${as}  0         0        0     00:00:00      ${state}`;
                }).join('\n')
            ];
            return this.createOutput(output, device);
        }

        if (subCommand === 'routing-table') {
            const bgpRoutes = (device.routingTable || []).filter(r => r.proto === 'BGP');
            const output = [
                ' BGP Local router ID is ' + (device.bgpConfig.routerId || '0.0.0.0'),
                ' Status codes: * - valid, > - best, d - damped,',
                '               h - history,  i - internal, s - suppressed, S - Stale',
                '               Origin : i - IGP, e - EGP, ? - incomplete',
                '',
                '      Network            NextHop        MED        LocPrf    PrefVal Path/Ogn',
                '',
                bgpRoutes.map(r => {
                    const dest = `${r.destination}/${r.mask}`.padEnd(18);
                    const nextHop = r.nextHop.padEnd(15);
                    const med = (r.bgpAttributes?.med || 0).toString().padStart(10);
                    const locPrf = (r.bgpAttributes?.localPref || 100).toString().padStart(10);
                    const path = (r.bgpAttributes?.asPath || []).join(' ') + ' i';
                    return ` *>   ${dest} ${nextHop} ${med} ${locPrf}          0 ${path}`;
                }).join('\n')
            ];
            return this.createOutput(output, device);
        }

        return this.createOutput(['Usage: display bgp <peer | routing-table>'], device);
    }
}
