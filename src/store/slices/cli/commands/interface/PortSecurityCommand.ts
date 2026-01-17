/**
 * Port Security Command - Configure port security features
 * Handles: port-security enable|disable|mac-address sticky|max-mac-num <n>|protect-action|violation|recover
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class PortSecurityCommand extends Command {
  readonly name = 'port-security';
  readonly description = 'Configure port security';
  readonly requiredView = ['interface-view'];

  canHandle(context: CommandContext): boolean {
    const cmd = context.args[0]?.toLowerCase();
    const isUndo = context.normalizedCommand.toLowerCase().startsWith('undo port-security');
    return cmd === 'port-security' || isUndo;
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    if (!context.args[1]) {
      return {
        valid: false,
        error: 'Error: port-security commands: enable|disable|mac-address sticky|max-mac-num <n>|protect-action shutdown/protect'
      };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args, normalizedCommand } = context;
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

    // Handle undo port-security mac-address sticky
    if (normalizedCommand.toLowerCase() === 'undo port-security mac-address sticky') {
      const ps = device.ports[pIdx].config.portSecurity;
      if (ps) {
        ps.sticky = false;
        output.push('Info: Sticky MAC learning disabled.');
      }
      return this.createOutput(output, device);
    }

    // Initialize port security config if needed
    const ps = device.ports[pIdx].config.portSecurity = device.ports[pIdx].config.portSecurity || {
      enabled: false,
      maxMacs: 1,
      sticky: false,
      stickyMacs: [],
      shutdownOnViolation: true
    };

    const subCmd = args[1]?.toLowerCase();

    switch (subCmd) {
      case 'enable':
        ps.enabled = true;
        output.push('Info: Port-security enabled.');
        break;

      case 'disable':
        ps.enabled = false;
        output.push('Info: Port-security disabled.');
        break;

      case 'mac-address':
        if (args[2]?.toLowerCase() === 'sticky') {
          ps.sticky = true;
          output.push('Info: Sticky MAC learning enabled.');
        }
        break;

      case 'max-mac-num':
      case 'max-mac': {
        const n = Number.parseInt(args[2], 10);
        if (!Number.isNaN(n) && n > 0) {
          ps.maxMacs = n;
          output.push(`Info: Max MACs set to ${n}.`);
        } else {
          return this.createError('max-mac-num must be a number.');
        }
        break;
      }

      case 'protect-action':
      case 'violation': {
        const action = args[2]?.toLowerCase();
        ps.shutdownOnViolation = action === 'shutdown';
        output.push(`Info: Violation action ${ps.shutdownOnViolation ? 'shutdown' : 'protect/restrict'}.`);
        break;
      }

      case 'recover': {
        const sec = Number.parseInt(args[2], 10);
        if (!Number.isNaN(sec) && sec > 0) {
          ps.recoverSeconds = sec;
          output.push(`Info: Port-security recovery ${sec}s.`);
        } else {
          return this.createError('recover <seconds>.');
        }
        break;
      }

      default:
        return this.createError('port-security commands: enable|disable|mac-address sticky|max-mac-num <n>|protect-action shutdown/protect');
    }

    return this.createOutput(output, device);
  }
}
