/**
 * CLI Module - Re-exports all CLI-related functions
 */

// Formatters
export {
  getPrompt,
  normalizeCommand,
  formatHelpLines,
  formatInterfaceSummary,
  formatCiscoVlanBrief,
  formatCiscoIpInterfaceBrief,
  formatCiscoIpRoute,
  formatCiscoRunningConfig,
  formatRunningConfig,
  formatCiscoVersion,
  formatCiscoInterfaceStatusLines,
  formatCiscoNatLines,
  formatCiscoQosHistory,
  formatHuaweiNatLines,
  formatStpFlags,
  formatStpCounters,
  expandPortRange,
  getDeviceIp,
  getDscpFromArgs
} from './formatters.js';

// Helpers
export {
  // Types
  type AclHit,
  type QosTraceEntry,
  // IP utilities
  ipToInt,
  matchesCidr,
  matchesProtocol,
  matchesPortValue,
  // ACL functions
  findRuleMatch,
  evaluateAclPath,
  bumpAclHits,
  // QoS functions
  findQosQueue,
  traceQosPath,
  summarizeQosTrace,
  computeQosDelay,
  recordQosUsage,
  applyQosLimit,
  // NAT functions
  describeNatTranslation,
  buildNatSession,
  getNatRuleForOut,
  analyzeNatPath
} from './helpers.js';

// Commands (Command Pattern)
export * from './commands/index.js';

// Validators
export * from './validators/index.js';

// Command Executor
export { executeCliCommand, initializeCommandRegistry } from './CommandExecutor.js';
