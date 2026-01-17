/**
 * Save Command - Save device configuration
 * Handles: save
 */

import { Command, CommandContext, CommandResult } from '../base/Command.js';

export class SaveCommand extends Command {
  readonly name = 'save';
  readonly description = 'Save device configuration';

  canHandle(context: CommandContext): boolean {
    return context.normalizedCommand.toLowerCase() === 'save';
  }

  validate(context: CommandContext): { valid: boolean; error?: string } {
    const view = context.device.cliState.view;
    if (['interface-view', 'pool-view'].includes(view as string)) {
      return { valid: false, error: 'Error: Cannot save from current view. Use return first.' };
    }
    return { valid: true };
  }

  execute(context: CommandContext): CommandResult {
    const { device } = context;
    const output: string[] = [];

    output.push('Saving configuration...done');

    return this.createOutput(output, device);
  }
}

export class ResetSavedConfigCommand extends Command {
  readonly name = 'reset saved-configuration';
  readonly description = 'Reset saved configuration';

  canHandle(context: CommandContext): boolean {
    return context.normalizedCommand.toLowerCase() === 'reset saved-configuration';
  }

  execute(context: CommandContext): CommandResult {
    const output: string[] = [];
    output.push('Warning: config reset simulated (no-op).');
    return this.createOutput(output, context.device);
  }
}

export class BannerCommand extends Command {
  readonly name = 'banner';
  readonly description = 'Set login banner';

  canHandle(context: CommandContext): boolean {
    return context.args[0]?.toLowerCase() === 'banner';
  }

  execute(context: CommandContext): CommandResult {
    const output: string[] = [];
    output.push('Banner set (simulated).');
    return this.createOutput(output, context.device);
  }
}

export class MotdCommand extends Command {
  readonly name = 'motd';
  readonly description = 'Set message of the day';

  canHandle(context: CommandContext): boolean {
    return context.args[0]?.toLowerCase() === 'motd';
  }

  execute(context: CommandContext): CommandResult {
    const output: string[] = [];
    output.push('MOTD set (simulated).');
    return this.createOutput(output, context.device);
  }
}

/**
 * Cisco: copy running-config startup-config
 */
export class CopyRunningConfigCommand extends Command {
  readonly name = 'copy running-config startup-config';
  readonly description = 'Copy running configuration to startup (Cisco)';
  readonly vendor = 'cisco';

  canHandle(context: CommandContext): boolean {
    const cmd = context.rawInput.toLowerCase();
    return cmd.startsWith('copy running-config startup-config');
  }

  execute(context: CommandContext): CommandResult {
    const { device } = context;
    const output: string[] = [];

    const nextVersion = (device.startupConfigVersion ?? 0) + 1;
    device.startupConfigVersion = nextVersion;
    device.lastConfigSave = Date.now();

    output.push('Destination filename [startup-config]?');
    output.push('Building configuration...');
    output.push(`Startup configuration saved (version ${nextVersion}).`);

    return this.createOutput(output, device);
  }
}
