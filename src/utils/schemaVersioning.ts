/**
 * Schema Versioning System for NetSim.dev
 *
 * Manages schema versions and provides metadata about migrations.
 * This allows data persistence across schema changes without breaking
 * existing topologies.
 */

export const SCHEMA_VERSION = 3;  // Current version
export const MIN_SUPPORTED_VERSION = 1;  // Oldest supported version (maintains 5-version compatibility window)

/**
 * Defines a schema version with metadata about changes
 */
export interface SchemaVersion {
  version: number;
  name: string;
  description: string;
  date: string;
  changes: string[];
}

/**
 * Registry of all schema versions
 * When adding a new version, add it here AND create corresponding migrations in schemaMigrations.ts
 */
export const SCHEMA_VERSIONS: SchemaVersion[] = [
  {
    version: 1,
    name: 'Initial Schema',
    date: '2024-01',
    description: 'Original schema with basic device/cable structure',
    changes: ['Initial devices and cables']
  },
  {
    version: 2,
    name: 'QoS & ACL Addition',
    date: '2024-06',
    description: 'Added QoS, ACL, NAT, and port security features',
    changes: [
      'Added qos config to PortConfig',
      'Added aclRules to NetworkDevice',
      'Added natRules and natSessions',
      'Added portSecurity to PortConfig'
    ]
  },
  {
    version: 3,
    name: 'OSPF & VRRP Enhanced',
    date: '2025-01',
    description: 'Enhanced OSPF, VRRP, and snapshot metadata with model normalization',
    changes: [
      'Added ospfLsdb to NetworkDevice',
      'Added vrrp array to VlanInterface',
      'Added snapshot version tracking',
      'Normalized model names (legacy models mapped to NS- names)',
      'Vendor standardization (NetSim, Cisco)'
    ]
  }
];

/**
 * Future versions 4 & 5 can be added as schema evolves
 * Once v6+ is released, v1 can be dropped (maintain 5-version window)
 *
 * Example for future version:
 * {
 *   version: 4,
 *   name: 'Next Feature Addition',
 *   date: '2025-06',
 *   description: '...',
 *   changes: [...]
 * }
 */

/**
 * Get schema version by number
 */
export function getSchemaVersion(version: number): SchemaVersion | undefined {
  return SCHEMA_VERSIONS.find(v => v.version === version);
}

/**
 * Check if a version is supported
 */
export function isSupportedVersion(version: number): boolean {
  return version >= MIN_SUPPORTED_VERSION && version <= SCHEMA_VERSION;
}

/**
 * Get all versions that need migration (older than current)
 */
export function getOutdatedVersions(): SchemaVersion[] {
  return SCHEMA_VERSIONS.filter(v => v.version < SCHEMA_VERSION);
}

/**
 * Get migration path from one version to another
 */
export function getMigrationPath(fromVersion: number, toVersion: number = SCHEMA_VERSION): SchemaVersion[] {
  if (fromVersion > toVersion) {
    throw new Error(`Cannot migrate backwards from v${fromVersion} to v${toVersion}`);
  }

  return SCHEMA_VERSIONS.filter(v => v.version > fromVersion && v.version <= toVersion);
}
