/**
 * Command Executor - Coordinates command execution using the registry
 */

import { NetworkDevice, NetworkCable } from '../../../types/NetworkTypes.js';
import { getVendorProfile } from '../../../utils/cliProfiles.js';
import { CommandContext, CommandResult, globalCommandRegistry } from './commands/index.js';
import { normalizeCommand, getPrompt } from './formatters.js';
import { generateUUID } from '../../../utils/common';
import {
  getNetworkAddress,
  findPath,
  getNextIp
} from '../../../utils/networkUtils';

import { PingCommand } from './commands/pc/PingCommand';
import { IpCommand } from './commands/pc/IpCommand';
import { VlanCommand } from './commands/network/VlanCommand';
import { BridgeDomainCommand } from './commands/network/BridgeDomainCommand';
import { VxlanVniCommand } from './commands/network/VxlanVniCommand';
import { SystemViewCommand, ReturnCommand } from './commands/navigation/SystemViewCommand';
import { InterfaceCommand } from './commands/navigation/InterfaceCommand';
import {
  DisplayInterfaceCommand,
  DisplayVlanCommand,
  DisplayAclCommand,
  DisplayOspfLsdbCommand,
  DisplayIpRoutingTableCommand,
  DisplayStpCommand,
  DisplayLldpCommand,
  DisplayEthTrunkCommand,
  DisplayArpCommand,
  DisplayMacAddressCommand,
  DisplayQosCommand,
  DisplayAlarmsCommand,
  DisplayLoopbackDetectCommand,
  DisplayBgpCommand,
  ShowVersionCommand,
  ShowVlanBriefCommand,
  ShowIpInterfaceBriefCommand,
  ShowIpRouteCommand,
  ShowRunningConfigCommand,
  DisplayIpInterfaceBriefCommand
} from './commands/display/index';
import { SaveCommand, ResetSavedConfigCommand, BannerCommand, MotdCommand, HelpCommand, CopyRunningConfigCommand } from './commands/system/index';
import { NetconfCommand, DisplayNetconfStatusCommand } from './commands/system/NetconfCommand';
import { ShutdownCommand } from './commands/interface/ShutdownCommand';
import { IpAddressCommand } from './commands/interface/IpAddressCommand';
import { LacpModeCommand } from './commands/interface/LacpModeCommand';
import { CommitCommand, AbortCommand, DisplayCandidateCommand, DisplayThisCommand } from './commands/navigation/YunShanCommands';
import { ArubaIpRouteCommand, ArubaNoIpRouteCommand } from './commands/system/ArubaIpRouteCommand';
import { ArubaRouterOspfCommand, ArubaOspfNetworkCommand, ArubaOspfRouterIdCommand } from './commands/system/ArubaOspfCommand';
import { MikroTikIpRouteAddCommand, MikroTikIpRoutePrintCommand, MikroTikIpRouteRemoveCommand } from './commands/system/MikroTikIpRouteCommand';
import { MikroTikOspfInstanceAddCommand, MikroTikOspfNetworkAddCommand, MikroTikOspfInstancePrintCommand, MikroTikOspfNeighborPrintCommand, MikroTikOspfInterfaceAddCommand } from './commands/system/MikroTikOspfCommand';
import { BgpCommand, PeerCommand, NetworkCommand, RouterIdCommand, PreferenceCommand, EvpnCommand } from './commands/bgp/index';

// Register core commands
export function initializeCommandRegistry(): void {
  try {
    // Register core commands
    globalCommandRegistry.register(new PingCommand());
    globalCommandRegistry.register(new IpCommand());
    globalCommandRegistry.register(new VlanCommand());
    globalCommandRegistry.register(new BridgeDomainCommand());
    globalCommandRegistry.register(new VxlanVniCommand());
    globalCommandRegistry.register(new SystemViewCommand());
    globalCommandRegistry.register(new ReturnCommand());
    globalCommandRegistry.register(new InterfaceCommand());
    globalCommandRegistry.register(new DisplayInterfaceCommand());
    globalCommandRegistry.register(new ShutdownCommand());
    globalCommandRegistry.register(new IpAddressCommand());
    globalCommandRegistry.register(new LacpModeCommand());
    globalCommandRegistry.register(new CommitCommand());
    globalCommandRegistry.register(new AbortCommand());
    globalCommandRegistry.register(new DisplayCandidateCommand());
    globalCommandRegistry.register(new DisplayThisCommand());

    // Register BGP commands
    globalCommandRegistry.register(new BgpCommand());
    globalCommandRegistry.register(new PeerCommand());
    globalCommandRegistry.register(new NetworkCommand());
    globalCommandRegistry.register(new RouterIdCommand());
    globalCommandRegistry.register(new PreferenceCommand());
    globalCommandRegistry.register(new EvpnCommand());

    // Register Aruba CX commands
    globalCommandRegistry.register(new ArubaIpRouteCommand());
    globalCommandRegistry.register(new ArubaNoIpRouteCommand());
    globalCommandRegistry.register(new ArubaRouterOspfCommand());
    globalCommandRegistry.register(new ArubaOspfNetworkCommand());
    globalCommandRegistry.register(new ArubaOspfRouterIdCommand());

    // Register MikroTik RouterOS commands
    globalCommandRegistry.register(new MikroTikIpRouteAddCommand());
    globalCommandRegistry.register(new MikroTikIpRoutePrintCommand());
    globalCommandRegistry.register(new MikroTikIpRouteRemoveCommand());
    globalCommandRegistry.register(new MikroTikOspfInstanceAddCommand());
    globalCommandRegistry.register(new MikroTikOspfNetworkAddCommand());
    globalCommandRegistry.register(new MikroTikOspfInstancePrintCommand());
    globalCommandRegistry.register(new MikroTikOspfNeighborPrintCommand());
    globalCommandRegistry.register(new MikroTikOspfInterfaceAddCommand());

    // Register new display commands
    globalCommandRegistry.register(new DisplayVlanCommand());
    globalCommandRegistry.register(new DisplayAclCommand());
    globalCommandRegistry.register(new DisplayOspfLsdbCommand());
    globalCommandRegistry.register(new DisplayIpRoutingTableCommand());
    globalCommandRegistry.register(new DisplayStpCommand());
    globalCommandRegistry.register(new DisplayLldpCommand());
    globalCommandRegistry.register(new DisplayEthTrunkCommand());
    globalCommandRegistry.register(new DisplayArpCommand());
    globalCommandRegistry.register(new DisplayMacAddressCommand());
    globalCommandRegistry.register(new DisplayQosCommand());
    globalCommandRegistry.register(new DisplayAlarmsCommand());
    globalCommandRegistry.register(new DisplayLoopbackDetectCommand());
    globalCommandRegistry.register(new DisplayBgpCommand());
    globalCommandRegistry.register(new DisplayIpInterfaceBriefCommand());

    // Register Cisco show commands
    globalCommandRegistry.register(new ShowVersionCommand());
    globalCommandRegistry.register(new ShowVlanBriefCommand());
    globalCommandRegistry.register(new ShowIpInterfaceBriefCommand());
    globalCommandRegistry.register(new ShowIpRouteCommand());
    globalCommandRegistry.register(new ShowRunningConfigCommand());

    // Register new system commands
    globalCommandRegistry.register(new SaveCommand());
    globalCommandRegistry.register(new ResetSavedConfigCommand());
    globalCommandRegistry.register(new BannerCommand());
    globalCommandRegistry.register(new MotdCommand());
    globalCommandRegistry.register(new HelpCommand());
    globalCommandRegistry.register(new CopyRunningConfigCommand());
    globalCommandRegistry.register(new NetconfCommand());
    globalCommandRegistry.register(new DisplayNetconfStatusCommand());

    console.log('CLI Command registry initialized with all features');
  } catch (error) {
    console.error('Failed to initialize command registry:', error);
  }
}

/**
 * Execute a CLI command using the command pattern
 */
export async function executeCliCommand(
  cmdInput: string,
  device: NetworkDevice,
  devices: NetworkDevice[],
  cables: NetworkCable[],
  cloneDevice: (id: string) => NetworkDevice | undefined,
  highlightTraffic: (path: string[], trace: any) => void,
  history?: string[]
): Promise<CommandResult> {
  const profile = getVendorProfile(device.vendor, device.model);
  const raw = cmdInput.trim();

  // Handle pipe commands
  const hasPipe = raw.includes('|');
  const [baseCmdRaw, pipeCmdRaw] = hasPipe
    ? [raw.split('|')[0].trim(), raw.split('|').slice(1).join('|').trim()]
    : [raw, ''];

  const normalizedCmd = normalizeCommand(baseCmdRaw, profile).trim();
  const args = normalizedCmd.split(/\s+/).filter(Boolean);

  // --- YUNSHAN REDIRECTION LOGIC ---
  let targetDevice: NetworkDevice = device;
  const isYunShan = profile.id === 'yunshan';

  const isCommitAbort = normalizedCmd.startsWith('commit') || normalizedCmd.startsWith('abort');
  const isDisplayCandidate = normalizedCmd.startsWith('display candidate-configuration');
  const isDisplayThis = normalizedCmd.startsWith('display this');
  const isPureDisplay = normalizedCmd.startsWith('display') || normalizedCmd.startsWith('show');

  if (isYunShan && !isCommitAbort) {
    if (isPureDisplay && !isDisplayCandidate && !isDisplayThis) {
      targetDevice = device; // Show running config
    } else {
      const isConfig = !isPureDisplay;
      if (isConfig && !device.candidateState) {
        device.candidateState = cloneDevice(device.id);
      }
      targetDevice = (device.candidateState as NetworkDevice) || device;
    }
  }

  // Build command context
  const context: CommandContext = {
    device: targetDevice,
    devices,
    cables,
    profile,
    rawInput: raw,
    normalizedCommand: normalizedCmd,
    args,
    cloneDevice,
    highlightTraffic,
    history,
    utils: {
      getNetworkAddress,
      getNextIp: (n, m, u, g) => getNextIp(n, m, u, g || ''),
      findPath,
      recomputeOspf: () => { }, // Placeholder
      generateUUID
    }
  };

  // Find appropriate command
  const command = globalCommandRegistry.findCommand(context);

  if (!command) {
    return {
      output: [
        `${getPrompt(device)} ${cmdInput}`,
        `Error: Unrecognized command. Type '?' for help.`
      ]
    };
  }

  // Validate command
  const validation = command.validate(context);
  if (!validation.valid) {
    return {
      output: [
        `${getPrompt(device)} ${cmdInput}`,
        validation.error || 'Command validation failed'
      ]
    };
  }

  // Execute command
  try {
    const result = await Promise.resolve(command.execute(context));

    if (!result.output[0]?.includes(getPrompt(device))) {
      result.output.unshift(`${getPrompt(device)} ${cmdInput}`);
    }

    if (pipeCmdRaw && result.output.length > 1) {
      result.output = applyPipeFilters(result.output, pipeCmdRaw);
    }

    const pageSize = 50;
    if (result.output.length > pageSize) {
      result.output = [
        ...result.output.slice(0, pageSize),
        `--- more (${result.output.length - pageSize} lines truncated) ---`
      ];
    }

    if (isYunShan && targetDevice === device.candidateState && result.device) {
      result.device = {
        ...device,
        candidateState: result.device,
        consoleLogs: [...device.consoleLogs, ...result.output]
      };
    }

    return result;
  } catch (error) {
    return {
      output: [
        `${getPrompt(device)} ${cmdInput}`,
        `Error: Command execution failed: ${error instanceof Error ? error.message : String(error)}`
      ]
    };
  }
}

function applyPipeFilters(output: string[], pipeCmd: string): string[] {
  let filtered = [...output];
  const pipes = pipeCmd.split('|').map(p => p.trim()).filter(Boolean);

  pipes.forEach(pipe => {
    const lowPipe = pipe.toLowerCase();

    if (lowPipe.startsWith('include')) {
      const term = pipe.split(/\s+/).slice(1).join(' ');
      if (term) {
        filtered = filtered.filter(line =>
          line.toLowerCase().includes(term.toLowerCase())
        );
      }
    } else if (lowPipe.startsWith('exclude')) {
      const term = pipe.split(/\s+/).slice(1).join(' ');
      if (term) {
        filtered = filtered.filter(line =>
          !line.toLowerCase().includes(term.toLowerCase())
        );
      }
    } else if (lowPipe.startsWith('begin')) {
      const term = pipe.split(/\s+/)[1] || '';
      if (term) {
        const idx = filtered.findIndex((line, i) =>
          i > 0 && line.toLowerCase().includes(term.toLowerCase())
        );
        if (idx > 0) {
          filtered = [filtered[0], ...filtered.slice(idx)];
        }
      }
    }
  });

  return filtered;
}
