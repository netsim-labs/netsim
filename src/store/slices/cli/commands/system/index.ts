/**
 * System Commands - System configuration commands
 */

export { SysnameCommand } from './SysnameCommand.js';
export { OspfEnableCommand, OspfTimerCommand } from './OspfCommand.js';
export { DhcpEnableCommand } from './DhcpEnableCommand.js';
export { IpPoolCommand } from './IpPoolCommand.js';
export { IpRouteStaticCommand } from './IpRouteStaticCommand.js';
export {
  NatShowCommand,
  NatStaticAddCommand,
  NatDynamicAddCommand,
  NatRuleDeleteCommand
} from './NatCommand.js';
export { AclRuleAddCommand, AclRuleDeleteCommand } from './AclCommand.js';
export {
  SaveCommand,
  ResetSavedConfigCommand,
  BannerCommand,
  MotdCommand,
  CopyRunningConfigCommand
} from './SaveCommand.js';
export { HelpCommand } from './HelpCommand.js';

// Aruba CX Commands
export { ArubaIpRouteCommand, ArubaNoIpRouteCommand } from './ArubaIpRouteCommand.js';
export {
  ArubaRouterOspfCommand,
  ArubaOspfNetworkCommand,
  ArubaOspfRouterIdCommand
} from './ArubaOspfCommand.js';

// MikroTik RouterOS Commands
export {
  MikroTikIpRouteAddCommand,
  MikroTikIpRoutePrintCommand,
  MikroTikIpRouteRemoveCommand
} from './MikroTikIpRouteCommand.js';
export {
  MikroTikOspfInstanceAddCommand,
  MikroTikOspfNetworkAddCommand,
  MikroTikOspfInstancePrintCommand,
  MikroTikOspfNeighborPrintCommand,
  MikroTikOspfInterfaceAddCommand
} from './MikroTikOspfCommand.js';
