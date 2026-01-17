/**
 * QoS Command - Configure Quality of Service on interface
 * Handles: qos limit <Mbps>, qos shape <percent>, qos queue add/delete, qos undo limit/shape
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class QosCommand extends Command {
  readonly name = 'qos';
  readonly description = 'Configure QoS on interface';
  readonly requiredView = ['interface-view'];

  canHandle(context: CommandContext): boolean {
    return context.args[0]?.toLowerCase() === 'qos';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    if (!context.args[1]) {
      return { valid: false, error: 'Error: qos <limit|shape|queue|undo ...>' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];
    const ifaceId = device.cliState.currentInterfaceId;

    if (!ifaceId) {
      return this.createError('Interface not selected.');
    }

    // Only applies to regular ports
    if (ifaceId.startsWith('vlanif') || ifaceId.startsWith('eth-trunk')) {
      return this.createError('Command not applicable to this interface type.');
    }

    const pIdx = device.ports.findIndex(p => p.id === ifaceId);
    if (pIdx === -1) {
      return this.createError('Interface not selected.');
    }

    // Initialize QoS config if needed
    const qos = device.ports[pIdx].config.qos = device.ports[pIdx].config.qos || { queues: [] };
    const subCmd = args[1].toLowerCase();

    switch (subCmd) {
      case 'limit':
        return this.handleLimit(qos, args, output, device);

      case 'shape':
        return this.handleShape(qos, args, output, device);

      case 'queue':
        return this.handleQueue(qos, args, output, device);

      case 'undo':
        return this.handleUndo(qos, args, output, device);

      default:
        return this.createError('qos <limit|shape|queue ...>');
    }
  }

  private handleLimit(
    qos: any,
    args: string[],
    output: string[],
    device: CommandContext['device']
  ): CommandResult {
    const limit = Number.parseInt(args[2], 10);

    if (Number.isNaN(limit) || limit <= 0) {
      return this.createError('qos limit <Mbps> (value > 0)');
    }

    qos.limitMbps = limit;
    output.push(`Info: qos limit set to ${limit} Mbps.`);
    return this.createOutput(output, device);
  }

  private handleShape(
    qos: any,
    args: string[],
    output: string[],
    device: CommandContext['device']
  ): CommandResult {
    const pct = Number.parseInt(args[2], 10);

    if (Number.isNaN(pct) || pct < 1 || pct > 100) {
      return this.createError('qos shape <percent 1-100>');
    }

    qos.shapePct = pct;
    output.push(`Info: qos shape set to ${pct}%.`);
    return this.createOutput(output, device);
  }

  private handleQueue(
    qos: any,
    args: string[],
    output: string[],
    device: CommandContext['device']
  ): CommandResult {
    const action = args[2]?.toLowerCase();

    if (action === 'add' && args[3]) {
      const name = args[3];

      // Parse weight
      const weightIdx = args.indexOf('weight');
      const weight = weightIdx !== -1 && args[weightIdx + 1]
        ? Number.parseInt(args[weightIdx + 1], 10)
        : 1;

      // Parse dscp
      const dscpIdx = args.indexOf('dscp');
      const dscp = dscpIdx !== -1 && args[dscpIdx + 1]
        ? Number.parseInt(args[dscpIdx + 1], 10)
        : 0;

      if (Number.isNaN(weight) || weight <= 0) {
        return this.createError('queue weight must be > 0.');
      }
      if (Number.isNaN(dscp) || dscp < 0 || dscp > 63) {
        return this.createError('queue dscp must be 0-63.');
      }

      qos.queues = qos.queues || [];
      const existing = qos.queues.find((q: any) => q.name === name);

      if (existing) {
        existing.weight = weight;
        existing.dscp = dscp;
        output.push(`Info: queue ${name} updated (weight ${weight}, dscp ${dscp}).`);
      } else {
        qos.queues.push({ name, weight, dscp });
        output.push(`Info: queue ${name} added (weight ${weight}, dscp ${dscp}).`);
      }

      return this.createOutput(output, device);
    }

    if (action === 'delete' && args[3]) {
      const name = args[3];
      qos.queues = (qos.queues || []).filter((q: any) => q.name !== name);
      output.push(`Info: queue ${name} removed.`);
      return this.createOutput(output, device);
    }

    return this.createError('qos queue add <name> weight <n> dscp <n> | qos queue delete <name>');
  }

  private handleUndo(
    qos: any,
    args: string[],
    output: string[],
    device: CommandContext['device']
  ): CommandResult {
    const target = args[2]?.toLowerCase();

    if (target === 'limit') {
      qos.limitMbps = undefined;
      output.push('Info: qos limit cleared.');
      return this.createOutput(output, device);
    }

    if (target === 'shape') {
      qos.shapePct = undefined;
      output.push('Info: qos shape cleared.');
      return this.createOutput(output, device);
    }

    return this.createError('qos undo <limit|shape>');
  }
}
