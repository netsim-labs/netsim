import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class VxlanVniCommand extends Command {
    readonly name = 'vxlan-vni';
    readonly description = 'Map Bridge Domain to VXLAN VNI';
    readonly requiredView = ['interface-view']; // Used as proxy for BD-view

    canHandle(context: CommandContext): boolean {
        return context.args[0]?.toLowerCase() === 'vxlan' && context.args[1]?.toLowerCase() === 'vni';
    }

    validate(context: CommandContext): { valid: boolean; error?: string } {
        const bdId = (context.device.cliState as any).currentBdId;
        if (!bdId) {
            return { valid: false, error: 'This command can only be used inside bridge-domain view' };
        }

        if (context.args.length < 3) {
            return { valid: false, error: 'Usage: vxlan vni <vni-id>' };
        }

        return { valid: true };
    }

    execute(context: CommandContext): CommandResult {
        const { device, args } = context;
        const vni = parseInt(args[2], 10);
        const bdId = (device.cliState as any).currentBdId;

        const bd = device.bridgeDomains?.find(b => b.id === bdId);
        if (bd) {
            bd.vni = vni;
            if (!device.vxlanVnis) device.vxlanVnis = [];
            // Add or update VNI mapping
            const existing = device.vxlanVnis.find(v => v.vni === vni);
            if (!existing) {
                device.vxlanVnis.push({ vni, vtepIp: '0.0.0.0', bdId });
            } else {
                existing.bdId = bdId;
            }
        }

        return this.createOutput([`Info: VXLAN VNI ${vni} is mapped to bridge-domain ${bdId}`], device);
    }
}
