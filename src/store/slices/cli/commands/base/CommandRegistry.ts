/**
 * Command Registry - Central registry for all CLI commands
 */

import { ICommand, CommandContext } from './Command.js';

/**
 * Registry that manages all available commands
 */
export class CommandRegistry {
  private commands: ICommand[] = [];
  private commandsByVendor: Map<string, ICommand[]> = new Map();

  /**
   * Register a new command
   */
  register(command: ICommand): void {
    this.commands.push(command);

    // Index by vendor for faster lookup
    const vendor = command.vendor || 'all';
    if (!this.commandsByVendor.has(vendor)) {
      this.commandsByVendor.set(vendor, []);
    }
    this.commandsByVendor.get(vendor)!.push(command);
  }

  /**
   * Register multiple commands at once
   */
  registerMany(commands: ICommand[]): void {
    commands.forEach(cmd => this.register(cmd));
  }

  /**
   * Find a command that can handle the given context
   */
  findCommand(context: CommandContext): ICommand | null {
    const vendor = context.profile.id;

    // First try vendor-specific commands
    const vendorCommands = this.commandsByVendor.get(vendor) || [];
    for (const cmd of vendorCommands) {
      if (cmd.canHandle(context)) {
        return cmd;
      }
    }

    // Then try generic commands
    const genericCommands = this.commandsByVendor.get('all') || [];
    for (const cmd of genericCommands) {
      if (cmd.canHandle(context)) {
        return cmd;
      }
    }

    return null;
  }

  /**
   * Get all registered commands
   */
  getAllCommands(): ICommand[] {
    return [...this.commands];
  }

  /**
   * Get commands for a specific vendor
   */
  getCommandsForVendor(vendor: string): ICommand[] {
    const vendorCmds = this.commandsByVendor.get(vendor) || [];
    const genericCmds = this.commandsByVendor.get('all') || [];
    return [...vendorCmds, ...genericCmds];
  }

  /**
   * Clear all registered commands (useful for testing)
   */
  clear(): void {
    this.commands = [];
    this.commandsByVendor.clear();
  }
}

// Global registry instance
export const globalCommandRegistry = new CommandRegistry();
