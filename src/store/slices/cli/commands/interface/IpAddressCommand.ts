/**
 * IP Address Command - Configure IP address on interface
 * Handles: ip address <ip> <mask>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class IpAddressCommand extends Command {
  readonly name = 'ip address';
  readonly description = 'Configure IP address on interface';
  readonly requiredView = ['interface-view'];

  canHandle(context: CommandContext): boolean {
    const { args } = context;
    return args[0]?.toLowerCase() === 'ip' && args[1]?.toLowerCase() === 'address';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    if (!context.args[2] || !context.args[3]) {
      return { valid: false, error: 'Error: ip address <ip> <mask>' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args, utils } = context;
    const output: string[] = [];
    const ifaceId = device.cliState.currentInterfaceId;
    const ip = args[2];
    const maskInput = args[3];

    // Convert dotted decimal mask to CIDR if needed
    let mask: number;
    if (maskInput.includes('.')) {
      // Dotted decimal format (255.255.255.0)
      const parts = maskInput.split('.').map(Number);
      if (parts.length === 4) {
        mask = parts.reduce((acc, octet) => {
          const bits = [128, 64, 32, 16, 8, 4, 2, 1];
          let bitCount = 0;
          for (let i = 0; i < 8; i++) {
            if ((octet & bits[i]) !== 0) bitCount++;
            else break;
          }
          return acc + bitCount;
        }, 0);
      } else {
        mask = 24; // fallback
      }
    } else {
      // CIDR format (24)
      mask = Number.parseInt(maskInput, 10);
      mask = Number.isNaN(mask) ? 24 : mask;
    }

    if (!ifaceId) {
      return this.createError('Interface not selected.');
    }

    // Handle vlanif
    if (ifaceId.startsWith('vlanif')) {
      return this.handleVlanif(device, ifaceId, ip, mask, utils, output);
    }

    // Handle eth-trunk
    if (ifaceId.startsWith('eth-trunk')) {
      return this.handleEthTrunk(device, ifaceId, ip, mask, utils, output);
    }

    // Handle regular port
    return this.handlePort(device, ifaceId, ip, mask, utils, output);
  }

  private handleVlanif(
    device: CommandContext['device'],
    ifaceId: string,
    ip: string,
    mask: number,
    utils: CommandContext['utils'],
    output: string[]
  ): CommandResult {
    device.vlanifs = device.vlanifs || [];
    const idx = device.vlanifs.findIndex(v => v.id === ifaceId);

    if (idx === -1) {
      return this.createError('Interface not selected.');
    }

    device.vlanifs[idx].ipAddress = ip;
    device.vlanifs[idx].subnetMask = mask;

    // Update routing table
    device.routingTable = (device.routingTable || []).filter(
      r => r.interface !== device.vlanifs![idx].id
    );
    device.routingTable.push({
      destination: utils.getNetworkAddress(ip, mask),
      mask,
      proto: 'Direct',
      pre: 0,
      cost: 0,
      nextHop: '127.0.0.1',
      interface: device.vlanifs![idx].id
    });

    output.push(`Info: IP ${ip} assigned.`);
    return this.createOutput(output, device);
  }

  private handleEthTrunk(
    device: CommandContext['device'],
    ifaceId: string,
    ip: string,
    mask: number,
    utils: CommandContext['utils'],
    output: string[]
  ): CommandResult {
    device.ethTrunks = device.ethTrunks || [];
    const idx = device.ethTrunks.findIndex(t => `eth-trunk${t.id}` === ifaceId);

    if (idx === -1) {
      return this.createError('Interface not selected.');
    }

    device.ethTrunks[idx].ipAddress = ip;
    device.ethTrunks[idx].subnetMask = mask;

    // Update routing table
    device.routingTable = (device.routingTable || []).filter(
      r => r.interface !== device.ethTrunks![idx].name
    );
    device.routingTable.push({
      destination: utils.getNetworkAddress(ip, mask),
      mask,
      proto: 'Direct',
      pre: 0,
      cost: 0,
      nextHop: '127.0.0.1',
      interface: device.ethTrunks![idx].name
    });

    output.push(`Info: IP ${ip} assigned.`);
    return this.createOutput(output, device);
  }

  private handlePort(
    device: CommandContext['device'],
    ifaceId: string,
    ip: string,
    mask: number,
    utils: CommandContext['utils'],
    output: string[]
  ): CommandResult {
    const pIdx = device.ports.findIndex(p => p.id === ifaceId);

    if (pIdx === -1) {
      return this.createError('Interface not selected.');
    }

    device.ports[pIdx].config.ipAddress = ip;
    device.ports[pIdx].config.subnetMask = mask;

    // Update routing table
    device.routingTable = (device.routingTable || []).filter(
      r => r.interface !== device.ports[pIdx].name
    );
    device.routingTable.push({
      destination: utils.getNetworkAddress(ip, mask),
      mask,
      proto: 'Direct',
      pre: 0,
      cost: 0,
      nextHop: '127.0.0.1',
      interface: device.ports[pIdx].name
    });

    output.push(`Info: IP ${ip} assigned.`);
    return this.createOutput(output, device);
  }
}
