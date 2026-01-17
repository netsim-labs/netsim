/**
 * IP Command - PC IP configuration
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { validateIpAddress, validateSubnetMask, validateArgumentCount } from '../../validators/index.js';

export class IpCommand extends Command {
  readonly name = 'ip';
  readonly description = 'Configure IP address on PC';
  readonly vendor = null;

  canHandle(context: CommandContext): boolean {
    const isPc = context.device.vendor === 'PC' || context.device.model === 'PC';
    return isPc && context.args[0]?.toLowerCase() === 'ip';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const { args } = context;

    if (args.length < 2) {
      return { valid: true }; // Show/addr commands
    }

    const subCmd = args[1]?.toLowerCase();

    if (subCmd === 'set') {
      const argCheck = validateArgumentCount(args, 4, 4);
      if (!argCheck.valid) {
        return argCheck;
      }

      const ipCheck = validateIpAddress(args[2]);
      if (!ipCheck.valid) {
        return ipCheck;
      }

      const mask = parseInt(args[3], 10);
      const maskCheck = validateSubnetMask(mask);
      if (!maskCheck.valid) {
        return maskCheck;
      }
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args, utils } = context;
    const nic = device.ports[0];
    const output: string[] = [];

    const subCmd = args[1]?.toLowerCase();

    // ip show / ip addr / ip address show
    if (!subCmd || subCmd === 'show' || subCmd === 'addr' || args[2] === 'show') {
      output.push(`eth0: ${nic.config.ipAddress ?? 'unassigned'}/${nic.config.subnetMask ?? '-'}`);
      output.push(`VLAN: ${nic.config.vlan ?? 1}`);
      return this.createOutput(output, device);
    }

    // ip set <ip> <mask>
    if (subCmd === 'set') {
      const ip = args[2];
      const mask = parseInt(args[3], 10);

      nic.config.ipAddress = ip;
      nic.config.subnetMask = mask;

      // Update routing table
      device.routingTable = (device.routingTable || []).filter(r => r.interface !== nic.name);
      device.routingTable.push({
        destination: utils.getNetworkAddress(ip, mask),
        mask,
        proto: 'Direct',
        pre: 0,
        cost: 0,
        nextHop: '127.0.0.1',
        interface: nic.name
      });

      output.push(`IP set to ${ip}/${mask}`);
      return this.createOutput(output, device);
    }

    // ip route add default via <gateway>
    if (subCmd === 'route' && args[2] === 'add' && args[3] === 'default' && args[4] === 'via' && args[5]) {
      device.defaultGateway = args[5];
      output.push(`Default gateway set to ${device.defaultGateway}`);
      return this.createOutput(output, device);
    }

    // ip dhcp
    if (subCmd === 'dhcp') {
      const { cables, devices, utils } = context;
      const cable = cables.find(c => c.sourceDeviceId === device.id || c.targetDeviceId === device.id);

      if (!cable) {
        output.push('Error: No link.');
        return this.createOutput(output, device);
      }

      const serverId = cable.sourceDeviceId === device.id ? cable.targetDeviceId : cable.sourceDeviceId;
      const server = devices.find(d => d.id === serverId);

      if (!server?.dhcpEnabled || !server.dhcpPools || server.dhcpPools.length === 0) {
        output.push('Error: No DHCP server.');
        return this.createOutput(output, device);
      }

      const pool = server.dhcpPools[0];
      const nextIp = utils.getNextIp(pool.network, pool.mask, pool.usedIps || [], pool.gateway);

      if (!nextIp) {
        output.push('Error: DHCP pool exhausted.');
        return this.createOutput(output, device);
      }

      // Set IP from DHCP
      nic.config.ipAddress = nextIp;
      nic.config.subnetMask = pool.mask;
      pool.usedIps.push(nextIp);

      // Update routing table
      device.routingTable = (device.routingTable || []).filter(r => r.interface !== nic.name);
      device.routingTable.push({
        destination: utils.getNetworkAddress(nextIp, pool.mask),
        mask: pool.mask,
        proto: 'Direct',
        pre: 0,
        cost: 0,
        nextHop: '127.0.0.1',
        interface: nic.name
      });

      output.push(`DHCP ACK: ${nextIp}/${pool.mask} gw ${pool.gateway}`);
      return this.createOutput(output, device);
    }

    output.push('Error: Unknown IP subcommand. Use: ip show, ip set <ip> <mask>, ip dhcp');
    return this.createOutput(output, device);
  }
}
