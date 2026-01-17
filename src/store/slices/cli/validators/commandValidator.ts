/**
 * Command Validator - Validation utilities for CLI commands
 */

import { NetworkDevice } from '../../../../types/NetworkTypes';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate IP address format
 */
export function validateIpAddress(ip: string): ValidationResult {
  const parts = ip.split('.');

  if (parts.length !== 4) {
    return { valid: false, error: 'Invalid IP format (requires 4 octets)' };
  }

  for (const part of parts) {
    const num = parseInt(part, 10);
    if (isNaN(num) || num < 0 || num > 255) {
      return { valid: false, error: `Invalid octet: ${part}` };
    }
  }

  return { valid: true };
}

/**
 * Validate subnet mask (CIDR notation)
 */
export function validateSubnetMask(mask: number): ValidationResult {
  if (isNaN(mask) || mask < 0 || mask > 32) {
    return { valid: false, error: 'Subnet mask must be between 0 and 32' };
  }
  return { valid: true };
}

/**
 * Validate VLAN ID
 */
export function validateVlanId(vlanId: number): ValidationResult {
  if (isNaN(vlanId) || vlanId < 1 || vlanId > 4094) {
    return { valid: false, error: 'VLAN ID must be between 1 and 4094' };
  }
  return { valid: true };
}

/**
 * Validate port exists on device
 */
export function validatePortExists(device: NetworkDevice, portName: string): ValidationResult {
  const port = device.ports.find(p => p.name.toLowerCase() === portName.toLowerCase());

  if (!port) {
    return { valid: false, error: `Port ${portName} not found` };
  }

  return { valid: true };
}

/**
 * Validate port range (e.g., "GigabitEthernet0/0/1-5")
 */
export function validatePortRange(device: NetworkDevice, rangeSpec: string): ValidationResult {
  // Extract base and range (e.g., "GigabitEthernet0/0/1-5" => base="GigabitEthernet0/0/", range="1-5")
  const match = rangeSpec.match(/^(.+?)(\d+)-(\d+)$/);

  if (!match) {
    return { valid: false, error: 'Invalid port range format' };
  }

  const [, base, startStr, endStr] = match;
  const start = parseInt(startStr, 10);
  const end = parseInt(endStr, 10);

  if (start > end) {
    return { valid: false, error: 'Range start must be less than or equal to end' };
  }

  // Verify at least one port in range exists
  let foundAny = false;
  for (let i = start; i <= end; i++) {
    const portName = `${base}${i}`;
    if (device.ports.some(p => p.name === portName)) {
      foundAny = true;
      break;
    }
  }

  if (!foundAny) {
    return { valid: false, error: `No ports found in range ${rangeSpec}` };
  }

  return { valid: true };
}

/**
 * Validate interface name format
 */
export function validateInterfaceName(interfaceName: string): ValidationResult {
  if (!interfaceName || interfaceName.trim().length === 0) {
    return { valid: false, error: 'Interface name cannot be empty' };
  }

  // Common interface patterns
  const patterns = [
    /^GigabitEthernet\d+\/\d+\/\d+$/i,
    /^GE\d+\/\d+\/\d+$/i,
    /^Ethernet\d+\/\d+\/\d+$/i,
    /^Eth\d+\/\d+\/\d+$/i,
    /^Vlanif\d+$/i,
    /^LoopBack\d+$/i,
    /^Eth-Trunk\d+$/i,
    /^eth\d+$/i, // PC interfaces
  ];

  const matches = patterns.some(pattern => pattern.test(interfaceName));

  if (!matches) {
    return { valid: false, error: `Invalid interface name format: ${interfaceName}` };
  }

  return { valid: true };
}

/**
 * Validate number is within range
 */
export function validateNumberInRange(
  value: number,
  min: number,
  max: number,
  fieldName: string = 'Value'
): ValidationResult {
  if (isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  if (value < min || value > max) {
    return { valid: false, error: `${fieldName} must be between ${min} and ${max}` };
  }

  return { valid: true };
}

/**
 * Validate required arguments count
 */
export function validateArgumentCount(
  args: string[],
  min: number,
  max?: number
): ValidationResult {
  if (args.length < min) {
    return { valid: false, error: `Insufficient arguments (minimum ${min} required)` };
  }

  if (max !== undefined && args.length > max) {
    return { valid: false, error: `Too many arguments (maximum ${max} allowed)` };
  }

  return { valid: true };
}

/**
 * Validate device is in correct CLI view
 */
export function validateCliView(
  device: NetworkDevice,
  requiredViews: string[]
): ValidationResult {
  if (!requiredViews.includes(device.cliState.view)) {
    return {
      valid: false,
      error: `Command requires ${requiredViews.join(' or ')} (current: ${device.cliState.view})`
    };
  }

  return { valid: true };
}

/**
 * Validate OSPF area format
 */
export function validateOspfArea(area: string): ValidationResult {
  // Area can be a number (0-4294967295) or IP format (0.0.0.0)
  const areaNum = parseInt(area, 10);

  if (!isNaN(areaNum)) {
    if (areaNum < 0 || areaNum > 4294967295) {
      return { valid: false, error: 'OSPF area number must be between 0 and 4294967295' };
    }
    return { valid: true };
  }

  // Try IP format
  return validateIpAddress(area);
}

/**
 * Validate protocol name
 */
export function validateProtocol(protocol: string): ValidationResult {
  const validProtocols = ['tcp', 'udp', 'icmp', 'ip', 'any'];

  if (!validProtocols.includes(protocol.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid protocol. Valid values: ${validProtocols.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Validate port number
 */
export function validatePortNumber(port: number): ValidationResult {
  return validateNumberInRange(port, 0, 65535, 'Port number');
}

/**
 * Validate BGP AS number (Autonomous System)
 */
export function validateAsNumber(asn: number): ValidationResult {
  if (isNaN(asn) || asn < 1 || asn > 4294967295) {
    return { valid: false, error: 'AS number must be between 1 and 4294967295' };
  }
  return { valid: true };
}

