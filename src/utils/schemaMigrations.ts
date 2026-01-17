/**
 * Schema Migration System for NetSim.dev
 *
 * Handles upgrading and downgrading workspace data between schema versions.
 * Each migration includes:
 * - up(): Transform data to next version
 * - down() (optional): Revert data to previous version
 * - validate() (optional): Validate data before/after migration
 */

import { SCHEMA_VERSION, MIN_SUPPORTED_VERSION } from './schemaVersioning.js';
import { MigrationError, ValidationError, UnsupportedSchemaVersionError } from './persistenceErrors.js';

/**
 * Workspace data payload (what actually gets persisted)
 */
export interface WorkspaceData {
  devices: any[];
  cables: any[];
  activeGuide?: any;
  guideStepsDone?: number[];
  updatedAt?: number;
}

/**
 * Versioned wrapper for workspace data
 */
export interface VersionedWorkspaceData {
  schemaVersion: number;
  dataVersion?: string;
  metadata: {
    lastMigrated: number;
    migratedFrom: number;
    migratedBy: 'auto' | 'manual';
  };
  data: WorkspaceData;
}

/**
 * A single migration step between two schema versions
 */
export interface Migration {
  fromVersion: number;
  toVersion: number;
  name: string;
  /**
   * Transform data from fromVersion to toVersion
   */
  up(data: WorkspaceData): WorkspaceData;
  /**
   * Revert data from toVersion to fromVersion (optional, for rollback support)
   */
  down?(data: WorkspaceData): WorkspaceData;
  /**
   * Validate data before applying migration (optional)
   */
  validate?(data: WorkspaceData): boolean;
}

/**
 * Registry of all migrations
 * Migrations should be ordered by fromVersion (ascending)
 * When adding a new version, create both up() and down() functions
 */
export const MIGRATIONS: Migration[] = [
  {
    fromVersion: 1,
    toVersion: 2,
    name: 'Add QoS, ACL, NAT support',
    validate(data: WorkspaceData) {
      return data.devices.every(d => Array.isArray(d.ports));
    },
    up(data: WorkspaceData) {
      return {
        ...data,
        devices: data.devices.map(device => ({
          ...device,
          // Add empty arrays for new features if not present
          aclRules: device.aclRules || [],
          natRules: device.natRules || [],
          natSessions: device.natSessions || [],
          // Ensure ports have QoS and portSecurity config
          ports: device.ports.map((port: any) => ({
            ...port,
            config: {
              ...port.config,
              qos: port.config?.qos || undefined,
              portSecurity: port.config?.portSecurity || undefined
            }
          }))
        }))
      };
    },
    down(data: WorkspaceData) {
      // Remove new v2 fields to revert to v1
      return {
        ...data,
        devices: data.devices.map(device => {
           
          const { aclRules, natRules, natSessions, ...deviceWithoutV2 } = device;
          return {
            ...deviceWithoutV2,
            ports: device.ports.map((port: any) => {
               
              const { config, ...portWithoutConfig } = port;
              if (config) {
                 
                const { qos, portSecurity, ...configWithoutQoS } = config;
                return { ...portWithoutConfig, config: configWithoutQoS };
              }
              return portWithoutConfig;
            })
          };
        })
      };
    }
  },
  {
    fromVersion: 2,
    toVersion: 3,
    name: 'Enhance OSPF, VRRP, normalize models',
    validate(data: WorkspaceData) {
      return data.devices.every(d => Array.isArray(d.ports));
    },
    up(data: WorkspaceData) {
      return {
        ...data,
        devices: data.devices.map(device => ({
          ...device,
          // Initialize OSPF and VRRP structures
          ospfLsdb: device.ospfLsdb || [],
          vlanifs: (device.vlanifs || []).map((vlanif: any) => ({
            ...vlanif,
            vrrp: vlanif.vrrp || []
          }))
          // Model and vendor normalization happens at load time in PersistenceManager
        }))
      };
    },
    down(data: WorkspaceData) {
      // Revert to v2 by removing v3-specific fields
      return {
        ...data,
        devices: data.devices.map(device => {
           
          const { ospfLsdb, ...deviceWithoutOspf } = device;
          return {
            ...deviceWithoutOspf,
            vlanifs: (device.vlanifs || []).map((vlanif: any) => {
               
              const { vrrp, ...vlanifWithoutVrrp } = vlanif;
              return vlanifWithoutVrrp;
            })
          };
        })
      };
    }
  }
];

/**
 * Apply migrations to upgrade data from one schema version to another
 *
 * @param data Raw workspace data to migrate
 * @param fromVersion Current schema version of the data
 * @param toVersion Target schema version (defaults to SCHEMA_VERSION)
 * @returns Versioned workspace data with metadata
 * @throws MigrationError if migration fails
 * @throws UnsupportedSchemaVersionError if fromVersion is too old
 */
export function migrateWorkspaceData(
  data: any,
  fromVersion: number,
  toVersion: number = SCHEMA_VERSION
): VersionedWorkspaceData {
  // Validate that the source version is supported
  if (fromVersion < MIN_SUPPORTED_VERSION) {
    throw new UnsupportedSchemaVersionError(fromVersion, MIN_SUPPORTED_VERSION, SCHEMA_VERSION);
  }

  if (fromVersion > SCHEMA_VERSION) {
    console.warn(
      `⚠ Data is from a future schema version (v${fromVersion}). Current app version: v${SCHEMA_VERSION}. ` +
      `Proceeding without migration. Some features may not work correctly.`
    );
    return {
      schemaVersion: fromVersion,
      metadata: {
        lastMigrated: Date.now(),
        migratedFrom: fromVersion,
        migratedBy: 'auto'
      },
      data: data as WorkspaceData
    };
  }

  let result: WorkspaceData = data;
  let currentVersion = fromVersion;

  // Find applicable migrations (v1→v2, v2→v3, etc.)
  const applicableMigrations = MIGRATIONS.filter(
    m => m.fromVersion >= fromVersion && m.toVersion <= toVersion
  ).sort((a, b) => a.fromVersion - b.fromVersion);

  // Apply each migration in sequence
  for (const migration of applicableMigrations) {
    try {
      // Validate data structure before migration
      if (migration.validate && !migration.validate(result)) {
        throw new ValidationError(migration.name, 'Pre-migration validation failed');
      }

      // Apply the migration
      result = migration.up(result);
      currentVersion = migration.toVersion;

      console.log(`✓ Migration: ${migration.name} (v${migration.fromVersion} → v${migration.toVersion})`);
    } catch (error) {
      console.error(`✗ Migration ${migration.name} failed:`, error);
      throw new MigrationError(`Migration failed: ${migration.name}`, error instanceof Error ? error : undefined);
    }
  }

  return {
    schemaVersion: currentVersion,
    metadata: {
      lastMigrated: Date.now(),
      migratedFrom: fromVersion,
      migratedBy: 'auto'
    },
    data: result
  };
}

/**
 * Downgrade data to a previous schema version (rollback)
 * Only works if down migrations are defined for all steps
 *
 * @param data Versioned workspace data to downgrade
 * @param fromVersion Current schema version
 * @param toVersion Target schema version (must be < fromVersion)
 * @returns Versioned workspace data at target version
 * @throws MigrationError if downgrade fails
 * @throws Error if down migrations are not defined for the path
 */
export function downgradeWorkspaceData(
  data: WorkspaceData,
  fromVersion: number,
  toVersion: number
): VersionedWorkspaceData {
  if (toVersion >= fromVersion) {
    throw new Error(`Cannot downgrade from v${fromVersion} to v${toVersion}. Target must be older than current.`);
  }

  let result: WorkspaceData = data;
  let currentVersion = fromVersion;

  // Find applicable down migrations in reverse order
  // For v3→v2, we need the v2→v3 migration's down() function
  const applicableDownMigrations = MIGRATIONS
    .filter(m => m.down && m.toVersion <= fromVersion && m.fromVersion >= toVersion)
    .sort((a, b) => b.toVersion - a.toVersion); // Reverse order (v3→v2→v1)

  // Apply each down migration in sequence
  for (const migration of applicableDownMigrations) {
    try {
      if (!migration.down) {
        throw new Error(`No down migration available for: ${migration.name}`);
      }

      result = migration.down(result);
      currentVersion = migration.fromVersion;

      console.log(`↓ Downgrade: ${migration.name} (v${migration.toVersion} → v${migration.fromVersion})`);
    } catch (error) {
      console.error(`✗ Downgrade ${migration.name} failed:`, error);
      throw new MigrationError(`Downgrade failed: ${migration.name}`, error instanceof Error ? error : undefined);
    }
  }

  return {
    schemaVersion: currentVersion,
    metadata: {
      lastMigrated: Date.now(),
      migratedFrom: fromVersion,
      migratedBy: 'manual'
    },
    data: result
  };
}

/**
 * Check if downgrade path exists between two versions
 */
export function canDowngradeTo(fromVersion: number, toVersion: number): boolean {
  if (toVersion >= fromVersion) return false;

  const requiredMigrations = MIGRATIONS.filter(
    m => m.toVersion <= fromVersion && m.fromVersion >= toVersion
  );

  return requiredMigrations.every(m => m.down);
}

/**
 * Get all compatible migration paths from current version to target
 */
export function getMigrationHistory(fromVersion: number, toVersion: number = SCHEMA_VERSION): Migration[] {
  return MIGRATIONS.filter(
    m => m.fromVersion >= fromVersion && m.toVersion <= toVersion
  ).sort((a, b) => a.fromVersion - b.fromVersion);
}
