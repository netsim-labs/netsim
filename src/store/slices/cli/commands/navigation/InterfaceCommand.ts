/**
 * Interface Command - Enter interface configuration view
 * Handles: interface <name>, interface vlanif<id>, interface eth-trunk <id>, interface range
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

/**
 * Enter interface configuration view
 */
export class InterfaceCommand extends Command {
  readonly name = 'interface';
  readonly description = 'Enter interface configuration view';
  readonly aliases = ['int'];
  readonly requiredView = ['system-view'];

  canHandle(context: CommandContext): boolean {
    const cmd = context.args[0]?.toLowerCase();
    return cmd === 'interface' || cmd === 'int';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    // Check view requirements
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    // Need at least an interface argument
    if (!context.args[1]) {
      return { valid: false, error: 'Error: Incomplete command. Usage: interface <name|vlanif<id>|eth-trunk <id>|range>' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];
    const ifArg = args[1].toLowerCase();

    // Handle interface vlanif<id>
    if (ifArg.startsWith('vlanif')) {
      return this.handleVlanif(device, ifArg, output);
    }

    // Handle interface eth-trunk <id> (two formats)
    if (ifArg === 'eth-trunk' && args[2]) {
      return this.handleEthTrunk(device, args[2], output);
    }
    if (ifArg.startsWith('eth-trunk')) {
      const trunkIdStr = ifArg.replace('eth-trunk', '');
      return this.handleEthTrunk(device, trunkIdStr, output);
    }

    // Handle interface range
    if (ifArg === 'range' && args[2] && args[3]) {
      return this.handleRange(device, args.slice(2, 4), output);
    }

    // Handle regular interface (port)
    return this.handleRegularInterface(device, ifArg, output);
  }

  private handleVlanif(
    device: CommandContext['device'],
    ifArg: string,
    output: string[]
  ): CommandResult {
    const vlanId = Number.parseInt(ifArg.replace('vlanif', ''), 10);

    if (Number.isNaN(vlanId)) {
      return this.createError('Interface not found.');
    }

    // Initialize vlanifs array if needed
    device.vlanifs = device.vlanifs || [];

    // Create vlanif if it doesn't exist
    const existing = device.vlanifs.find(v => v.vlanId === vlanId);
    if (!existing) {
      device.vlanifs.push({
        id: `vlanif${vlanId}`,
        vlanId,
        enabled: true
      });
    }

    device.cliState.view = 'interface-view';
    device.cliState.currentInterfaceId = `vlanif${vlanId}`;

    return this.createOutput(output, device);
  }

  private handleEthTrunk(
    device: CommandContext['device'],
    trunkIdStr: string,
    output: string[]
  ): CommandResult {
    const trunkId = Number.parseInt(trunkIdStr, 10);

    if (Number.isNaN(trunkId)) {
      return this.createError('Interface not found.');
    }

    // Initialize ethTrunks array if needed
    device.ethTrunks = device.ethTrunks || [];

    // Create eth-trunk if it doesn't exist
    const existing = device.ethTrunks.find(t => t.id === trunkId.toString());
    if (!existing) {
      device.ethTrunks.push({
        id: trunkId.toString(),
        name: `Eth-Trunk${trunkId}`,
        members: [],
        enabled: true,
        mode: 'static',
        actorState: 'down',
        partnerState: 'down'
      });
    }

    device.cliState.view = 'interface-view';
    device.cliState.currentInterfaceId = `eth-trunk${trunkId}`;

    return this.createOutput(output, device);
  }

  private handleRange(
    device: CommandContext['device'],
    range: string[],
    output: string[]
  ): CommandResult {
    const matched = device.ports.filter(p =>
      range.some(r => p.name.toLowerCase().includes(r.toLowerCase()))
    );

    if (!matched.length) {
      return this.createError('Interface not found.');
    }

    device.cliState.view = 'interface-view';
    device.cliState.currentInterfaceId = matched[0].id;
    output.push(`Info: ${matched.length} interfaces in range (please apply manually to one at a time in this simulation).`);

    return this.createOutput(output, device);
  }

  private handleRegularInterface(
    device: CommandContext['device'],
    ifArg: string,
    output: string[]
  ): CommandResult {
    // Find port by exact name or name ending
    const found = device.ports.find(p =>
      p.name.toLowerCase() === ifArg || p.name.toLowerCase().endsWith(ifArg)
    );

    if (!found) {
      return this.createError('Interface not found.');
    }

    device.cliState.view = 'interface-view';
    device.cliState.currentInterfaceId = found.id;

    return this.createOutput(output, device);
  }
}
