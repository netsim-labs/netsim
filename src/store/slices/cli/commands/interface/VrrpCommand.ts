/**
 * VRRP Command - Configure Virtual Router Redundancy Protocol on VLANIF
 * Handles: vrrp <id> virtual-ip <ip>, vrrp <id> priority <prio>,
 *          vrrp <id> timer advertise <sec>, vrrp <id> preempt-mode [timer delay <sec>|disable]
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';
import { VrrpGroup } from '../../../../../types/NetworkTypes.js';

export class VrrpCommand extends Command {
  readonly name = 'vrrp';
  readonly description = 'Configure VRRP on VLANIF interface';
  readonly requiredView = ['interface-view'];

  canHandle(context: CommandContext): boolean {
    return context.args[0]?.toLowerCase() === 'vrrp';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    const ifaceId = context.device.cliState.currentInterfaceId;
    if (!ifaceId?.startsWith('vlanif')) {
      return { valid: false, error: 'Error: VRRP can only be configured on VLANIF interfaces.' };
    }

    if (!context.args[1]) {
      return { valid: false, error: 'Error: vrrp <group-id> <command>' };
    }

    const groupId = Number.parseInt(context.args[1], 10);
    if (Number.isNaN(groupId)) {
      return { valid: false, error: 'Error: Invalid VRRP group ID.' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];
    const ifaceId = device.cliState.currentInterfaceId;
    const groupId = Number.parseInt(args[1], 10);
    const subCmd = args[2]?.toLowerCase();

    device.vlanifs = device.vlanifs || [];
    const idx = device.vlanifs.findIndex(v => v.id === ifaceId);

    if (idx === -1) {
      return this.createError('Interface not selected.');
    }

    // Initialize VRRP array if needed
    device.vlanifs[idx].vrrp = device.vlanifs[idx].vrrp || [];

    switch (subCmd) {
      case 'virtual-ip':
        return this.handleVirtualIp(device, idx, groupId, args, output);

      case 'priority':
        return this.handlePriority(device, idx, groupId, args, output);

      case 'timer':
        return this.handleTimer(device, idx, groupId, args, output);

      case 'preempt-mode':
        return this.handlePreemptMode(device, idx, groupId, args, output);

      default:
        return this.createError('vrrp <id> virtual-ip <ip> | priority <n> | timer advertise <sec> | preempt-mode [timer delay <sec>|disable]');
    }
  }

  private getOrCreateGroup(device: CommandContext['device'], idx: number, groupId: number): VrrpGroup {
    const groupKey = groupId.toString();
    let grp = device.vlanifs![idx].vrrp!.find((g: VrrpGroup) => g.id === groupKey);
    if (!grp) {
      grp = {
        id: groupKey,
        virtualIp: '',
        priority: 100,
        state: 'BACKUP',
        advertiseInterval: 1,
        preemptMode: true,
        preemptDelay: 0
      };
      device.vlanifs![idx].vrrp!.push(grp);
    }
    return grp;
  }

  private handleVirtualIp(
    device: CommandContext['device'],
    idx: number,
    groupId: number,
    args: string[],
    output: string[]
  ): CommandResult {
    if (!args[3]) {
      return this.createError('vrrp <id> virtual-ip <ip>');
    }

    const grp = this.getOrCreateGroup(device, idx, groupId);
    grp.virtualIp = args[3];
    output.push(`Info: VRRP ${groupId} virtual-ip ${args[3]} set.`);

    return this.createOutput(output, device);
  }

  private handlePriority(
    device: CommandContext['device'],
    idx: number,
    groupId: number,
    args: string[],
    output: string[]
  ): CommandResult {
    const prio = Number.parseInt(args[3], 10);
    if (Number.isNaN(prio)) {
      return this.createError('prioridad invalida.');
    }

    const grp = this.getOrCreateGroup(device, idx, groupId);
    grp.priority = prio;
    output.push(`Info: VRRP ${groupId} priority ${prio}.`);

    return this.createOutput(output, device);
  }

  private handleTimer(
    device: CommandContext['device'],
    idx: number,
    groupId: number,
    args: string[],
    output: string[]
  ): CommandResult {
    if (args[3]?.toLowerCase() !== 'advertise' || !args[4]) {
      return this.createError('vrrp <id> timer advertise <sec>');
    }

    const interval = Number.parseInt(args[4], 10);
    if (Number.isNaN(interval) || interval <= 0) {
      return this.createError('vrrp <id> timer advertise <sec>');
    }

    const grp = this.getOrCreateGroup(device, idx, groupId);
    grp.advertiseInterval = interval;
    output.push(`Info: VRRP ${groupId} advertise-interval ${interval}s.`);

    return this.createOutput(output, device);
  }

  private handlePreemptMode(
    device: CommandContext['device'],
    idx: number,
    groupId: number,
    args: string[],
    output: string[]
  ): CommandResult {
    const grp = this.getOrCreateGroup(device, idx, groupId);

    // vrrp <id> preempt-mode disable
    if (args[3]?.toLowerCase() === 'disable') {
      grp.preemptMode = false;
      grp.preemptDelay = 0;
      output.push(`Info: VRRP ${groupId} preempt-mode disabled.`);
      return this.createOutput(output, device);
    }

    // vrrp <id> preempt-mode timer delay <sec>
    if (args[3]?.toLowerCase() === 'timer' && args[4]?.toLowerCase() === 'delay' && args[5]) {
      const delay = Number.parseInt(args[5], 10);
      if (Number.isNaN(delay) || delay < 0) {
        return this.createError('vrrp <id> preempt-mode timer delay <sec>');
      }
      grp.preemptDelay = delay;
      if (grp.preemptMode === false) grp.preemptMode = true;
      output.push(`Info: VRRP ${groupId} preempt-mode timer delay ${delay}s.`);
      return this.createOutput(output, device);
    }

    // vrrp <id> preempt-mode (enable)
    grp.preemptMode = true;
    output.push(`Info: VRRP ${groupId} preempt-mode enabled.`);
    return this.createOutput(output, device);
  }
}
