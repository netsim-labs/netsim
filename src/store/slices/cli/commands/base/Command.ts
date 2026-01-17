/**
 * Base Command Pattern Implementation
 * Provides the foundation for all CLI commands
 */

import { NetworkDevice, NetworkCable } from '../../../../../types/NetworkTypes.js';
import { CliVendorProfile } from '../../../../../utils/cliProfiles.js';

/**
 * Result of command execution
 */
export interface CommandResult {
  /** Output lines to display */
  output: string[];
  /** Updated device (if modified) */
  device?: NetworkDevice;
  /** Map of other devices that were updated */
  deviceUpdates?: Map<string, NetworkDevice>;
  /** Traffic path to highlight (if any) */
  trafficPath?: string[];
  /** Packet trace data */
  packetTrace?: any;
  /** Whether to prevent default CLI log behavior */
  preventLog?: boolean;
}

/**
 * Context passed to every command execution
 */
export interface CommandContext {
  /** Current device being controlled */
  device: NetworkDevice;
  /** All devices in the topology */
  devices: NetworkDevice[];
  /** All cables in the topology */
  cables: NetworkCable[];
  /** Vendor profile for current device */
  profile: CliVendorProfile;
  /** Raw command input */
  rawInput: string;
  /** Normalized command */
  normalizedCommand: string;
  /** Command arguments (split by whitespace) */
  args: string[];
  /** Function to clone a device safely */
  cloneDevice: (id: string) => NetworkDevice | undefined;
  /** Function to highlight traffic */
  highlightTraffic: (path: string[], trace: any) => void;
  /** Command history for the current session */
  history?: string[];
  /** Utility functions */
  utils: {
    getNetworkAddress: (ip: string, mask: number) => string;
    getNextIp: (network: string, mask: number, usedIps: string[], gateway?: string) => string | null;
    findPath: (srcId: string, dstId: string, cables: NetworkCable[], devices: NetworkDevice[], vlan: number) => string[] | null;
    recomputeOspf: (devices: NetworkDevice[]) => void;
    generateUUID: () => string;
  };
}

/**
 * Base Command interface
 */
export interface ICommand {
  /** Command name/pattern to match */
  readonly name: string;
  /** Short description */
  readonly description: string;
  /** Vendor this command is for (null = all vendors) */
  readonly vendor: string | null;
  /** Required CLI view(s) */
  readonly requiredView?: string[];
  /** Command aliases */
  readonly aliases?: string[];

  /**
   * Check if this command can handle the given input
   */
  canHandle(context: CommandContext): boolean;

  /**
   * Validate command arguments
   */
  validate(context: CommandContext): { valid: boolean; error?: string };

  /**
   * Execute the command
   */
  execute(context: CommandContext): Promise<CommandResult> | CommandResult;
}

/**
 * Abstract base class for commands
 */
export abstract class Command implements ICommand {
  abstract readonly name: string;
  abstract readonly description: string;
  readonly vendor: string | null = null;
  readonly requiredView?: string[];
  readonly aliases?: string[] = [];

  /**
   * Default implementation checks if command starts with name or alias
   */
  canHandle(context: CommandContext): boolean {
    const cmd = context.normalizedCommand.toLowerCase();

    // Check main name
    if (cmd.startsWith(this.name.toLowerCase())) {
      return true;
    }

    // Check aliases
    if (this.aliases && this.aliases.length > 0) {
      return this.aliases.some(alias => cmd.startsWith(alias.toLowerCase()));
    }

    return false;
  }

  /**
   * Default validation - override for specific validation logic
   */
  validate(context: CommandContext): { valid: boolean; error?: string } {
    // Check view requirements
    if (this.requiredView && this.requiredView.length > 0) {
      if (!this.requiredView.includes(context.device.cliState.view)) {
        return {
          valid: false,
          error: `Error: Command requires ${this.requiredView.join(' or ')} view`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Execute the command - must be implemented by subclasses
   */
  abstract execute(context: CommandContext): Promise<CommandResult> | CommandResult;

  /**
   * Helper to create basic output
   */
  protected createOutput(lines: string[], device?: NetworkDevice): CommandResult {
    return {
      output: lines,
      device
    };
  }

  /**
   * Helper to create error output
   */
  protected createError(message: string): CommandResult {
    return {
      output: [`Error: ${message}`]
    };
  }
}
