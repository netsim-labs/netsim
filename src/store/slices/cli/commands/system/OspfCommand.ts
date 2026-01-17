/**
 * OSPF Commands - Enable OSPF and configure timers
 * Handles: ospf enable, ospf timer hello <h> dead <d>
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class OspfEnableCommand extends Command {
  readonly name = 'ospf enable';
  readonly description = 'Enable OSPF routing protocol';
  readonly requiredView = ['system-view'];
  readonly vendor = null; // Support both Huawei and Cisco

  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();
    return cmd === 'ospf enable' || cmd.startsWith('router ospf');
  }

  execute(context: CommandContext): CommandResult {
    const { device, profile } = context;
    const output: string[] = [];

    device.ospfEnabled = true;

    if (profile.id === 'huawei') {
      output.push('Info: OSPF enabled.');
    } else if (profile.id === 'cisco') {
      output.push('Router(config)# router ospf 1');
      output.push('Router(config-router)#');
    }

    return this.createOutput(output, device);
  }
}

export class OspfTimerCommand extends Command {
  readonly name = 'ospf timer';
  readonly description = 'Configure OSPF timers';
  readonly requiredView = ['system-view'];

  canHandle(context: CommandContext): boolean {
    const { args } = context;
    return (
      args[0]?.toLowerCase() === 'ospf' &&
      args[1]?.toLowerCase() === 'timer' &&
      args[2]?.toLowerCase() === 'hello'
    );
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const viewCheck = super.validate(context);
    if (!viewCheck.valid) {
      return viewCheck;
    }

    const { args } = context;
    if (!args[3] || args[4]?.toLowerCase() !== 'dead' || !args[5]) {
      return { valid: false, error: 'Error: ospf timer hello <h> dead <d>.' };
    }

    const h = Number.parseInt(args[3], 10);
    const d = Number.parseInt(args[5], 10);

    if (Number.isNaN(h) || Number.isNaN(d) || h <= 0 || d <= h) {
      return { valid: false, error: 'Error: ospf timer hello <h> dead <d>. Dead must be > hello.' };
    }

    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device, args } = context;
    const output: string[] = [];

    const h = Number.parseInt(args[3], 10);
    const d = Number.parseInt(args[5], 10);

    device.ospfTimers = { hello: h, dead: d };
    output.push(`Info: OSPF timers set hello ${h}s dead ${d}s (simulado).`);

    return this.createOutput(output, device);
  }
}
