/**
 * Ping Command - PC ping functionality
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { validateIpAddress, validateArgumentCount } from '../../validators/index.js';
import { traceQosPath, computeQosDelay, summarizeQosTrace } from '../../helpers.js';

// Helper to extract DSCP value from args
const getDscpFromArgs = (args: string[]): number | undefined => {
  const dscpIdx = args.findIndex(a => a.toLowerCase() === 'dscp');
  if (dscpIdx >= 0 && args[dscpIdx + 1]) {
    const val = parseInt(args[dscpIdx + 1], 10);
    return isNaN(val) ? undefined : val;
  }
  return undefined;
};

export class PingCommand extends Command {
  readonly name = 'ping';
  readonly description = 'Send ICMP echo requests to test connectivity';
  readonly vendor = null; // Available for all vendors (PC)

  canHandle(context: CommandContext): boolean {
    const isPc = context.device.vendor === 'PC' || context.device.model === 'PC';
    return isPc && context.args[0]?.toLowerCase() === 'ping';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const argCheck = validateArgumentCount(context.args, 2, 5);
    if (!argCheck.valid) {
      return argCheck;
    }

    const targetIp = context.args[1];
    const ipCheck = validateIpAddress(targetIp);
    if (!ipCheck.valid) {
      return { valid: false, error: `Invalid target IP: ${ipCheck.error}` };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, devices, cables, args, highlightTraffic, utils } = context;
    const targetIp = args[1];
    const dscpValue = getDscpFromArgs(args);
    const nic = device.ports[0];

    const output: string[] = [
      `  PING ${targetIp}: 56 data bytes`
    ];

    // Find target device
    let targetDeviceId: string | null = null;
    for (const d of devices) {
      const hasPortIp = d.ports.some(p => p.config.ipAddress === targetIp);
      const hasVlanifIp = (d.vlanifs || []).some(v => v.ipAddress === targetIp);
      if (hasPortIp || hasVlanifIp) {
        targetDeviceId = d.id;
        break;
      }
    }

    if (!targetDeviceId) {
      output.push('  Request time out (Host unreachable).');
      return this.createOutput(output, device);
    }

    // Find path
    const path = utils.findPath(
      device.id,
      targetDeviceId,
      cables,
      devices,
      nic.config.vlan ?? 1
    );

    if (!path) {
      output.push('  Request time out (No route to host).');
      return this.createOutput(output, device);
    }

    // Trace QoS and compute delay
    const qosTrace = traceQosPath(path, devices, cables, device.id, dscpValue);
    const qosDelay = Math.round(computeQosDelay(qosTrace));
    const qosSummary = summarizeQosTrace(qosTrace);

    const firstTime = 20 + qosDelay;
    const secondTime = 20 + qosDelay + 2;

    output.push(`  Reply from ${targetIp}: bytes=56 time=${firstTime} ms`);
    output.push(`  Reply from ${targetIp}: bytes=56 time=${secondTime} ms`);

    if (qosSummary) {
      output.push(`  ${qosSummary}`);
    }

    output.push('  --- ping statistics ---');
    output.push('    1 packet(s) transmitted, 1 packet(s) received, 0.00% packet loss');

    // Highlight traffic
    highlightTraffic(path, {
      path,
      srcDeviceId: device.id,
      dstDeviceId: targetDeviceId ?? undefined,
      srcIp: nic.config.ipAddress,
      dstIp: targetIp,
      summary: qosSummary ?? undefined
    });

    return this.createOutput(output, device);
  }
}
