/**
 * Eth-Trunk Member Command - Add port to Eth-Trunk
 * Handles: eth-trunk <id> (when in interface-view of a port)
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { EthTrunk } from '../../../../../types/NetworkTypes.js';

export class EthTrunkMemberCommand extends Command {
  readonly name = 'eth-trunk';
  readonly description = 'Add port to Eth-Trunk aggregation group';
  readonly requiredView = ['interface-view'];

  canHandle(context: CommandContext): boolean {
    const { args, device } = context;
    // Only handle when in port interface-view (not eth-trunk view)
    const ifaceId = device.cliState.currentInterfaceId;
    if (ifaceId?.startsWith('eth-trunk') || ifaceId?.startsWith('vlanif')) {
      return false;
    }
    return args[0]?.toLowerCase() === 'eth-trunk';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    const trunkId = Number.parseInt(context.args[1], 10);
    if (Number.isNaN(trunkId)) {
      return { valid: false, error: 'Error: eth-trunk <id>' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];
    const ifaceId = device.cliState.currentInterfaceId;
    const trunkId = Number.parseInt(args[1], 10);

    if (!ifaceId) {
      return this.createError('Interface not selected.');
    }

    const pIdx = device.ports.findIndex(p => p.id === ifaceId);
    if (pIdx === -1) {
      return this.createError('Interface not selected.');
    }

    // Initialize ethTrunks array if needed
    device.ethTrunks = device.ethTrunks || [];

    // Find or create the eth-trunk
    let trunk = device.ethTrunks.find(t => t.id === trunkId.toString());
    if (!trunk) {
      trunk = {
        id: trunkId.toString(),
        name: `Eth-Trunk${trunkId}`,
        members: [],
        enabled: true,
        mode: 'static',
        actorState: 'down',
        partnerState: 'down'
      } as EthTrunk;
      device.ethTrunks.push(trunk);
    }

    // Add port to trunk if not already a member
    if (!trunk.members.includes(device.ports[pIdx].id)) {
      trunk.members.push(device.ports[pIdx].id);
      device.ports[pIdx].ethTrunkId = trunkId.toString();
      output.push(`Info: Added to Eth-Trunk${trunkId}.`);
    }

    return this.createOutput(output, device);
  }
}
