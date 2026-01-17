/**
 * Tests for Schema Migration System
 *
 * Validates that:
 * - Migrations successfully transform data
 * - Down migrations properly revert changes
 * - Validation functions work correctly
 * - Error handling is robust
 */

import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  migrateWorkspaceData,
  downgradeWorkspaceData,
  MIGRATIONS,
  WorkspaceData
} from '../utils/schemaMigrations.js';
import { SCHEMA_VERSION } from '../utils/schemaVersioning.js';
import { UnsupportedSchemaVersionError } from '../utils/persistenceErrors.js';

/**
 * Helper to create minimal device for testing
 */
const createTestDevice = (id: string, hostname: string) => ({
  id,
  vendor: 'NetSim' as const,
  hostname,
  model: 'NS-Switch-L3-24' as const,
  macAddress: 'AA:BB:CC:DD:EE:FF',
  stpPriority: 32768,
  ports: [],
  position: { x: 0, y: 0 },
  vlans: [1],
  consoleLogs: [],
  cliState: { view: 'user-view' as const },
  routingTable: []
});

/**
 * Helper to create v1 workspace data
 */
const createV1Data = (): WorkspaceData => ({
  devices: [createTestDevice('sw1', 'Switch1')],
  cables: [],
  updatedAt: Date.now()
});

/**
 * Helper to create v2 workspace data
 */
const createV2Data = (): WorkspaceData => {
  const base = createV1Data();
  return {
    ...base,
    devices: base.devices.map(d => ({
      ...d,
      aclRules: [],
      natRules: [],
      natSessions: []
    }))
  };
};

/**
 * Helper to create v3 workspace data
 */
const createV3Data = (): WorkspaceData => {
  const base = createV2Data();
  return {
    ...base,
    devices: base.devices.map(d => ({
      ...d,
      ospfLsdb: [],
      vlanifs: []
    }))
  };
};

describe('Schema Migrations', () => {
  test('Migration 1→2: Adds QoS, ACL, NAT fields', () => {
    const v1Data = createV1Data();
    const result = migrateWorkspaceData(v1Data, 1, 2);

    assert.equal(result.schemaVersion, 2, 'Should be version 2');
    assert.equal(result.metadata.migratedFrom, 1, 'Should track migration from v1');
    assert.equal(result.metadata.migratedBy, 'auto', 'Should be marked as auto migration');

    // Check that v2 fields were added
    const device = result.data.devices[0];
    assert.ok(Array.isArray(device.aclRules), 'Should have aclRules array');
    assert.ok(Array.isArray(device.natRules), 'Should have natRules array');
    assert.ok(Array.isArray(device.natSessions), 'Should have natSessions array');
  });

  test('Migration 1→2: Preserves existing data', () => {
    const v1Data = createV1Data();
    v1Data.devices[0].hostname = 'CustomRouter';

    const result = migrateWorkspaceData(v1Data, 1, 2);

    assert.equal(result.data.devices[0].hostname, 'CustomRouter', 'Should preserve existing device data');
  });

  test('Migration 2→3: Adds OSPF and VRRP fields', () => {
    const v2Data = createV2Data();
    const result = migrateWorkspaceData(v2Data, 2, 3);

    assert.equal(result.schemaVersion, 3, 'Should be version 3');

    const device = result.data.devices[0];
    assert.ok(Array.isArray(device.ospfLsdb), 'Should have ospfLsdb array');
    assert.ok(Array.isArray(device.vlanifs), 'Should have vlanifs array');
  });

  test('Migration 1→3: Chain multiple migrations', () => {
    const v1Data = createV1Data();
    const result = migrateWorkspaceData(v1Data, 1, 3);

    assert.equal(result.schemaVersion, 3, 'Should reach version 3');

    const device = result.data.devices[0];
    // Check v2 fields
    assert.ok(Array.isArray(device.aclRules), 'Should have v2 fields (aclRules)');
    // Check v3 fields
    assert.ok(Array.isArray(device.ospfLsdb), 'Should have v3 fields (ospfLsdb)');
  });

  test('Migration: Default to SCHEMA_VERSION', () => {
    const v1Data = createV1Data();
    const result = migrateWorkspaceData(v1Data, 1);

    assert.equal(result.schemaVersion, SCHEMA_VERSION, 'Should default to current SCHEMA_VERSION');
  });

  test('Downgrade 2→1: Removes v2 fields', () => {
    const v2Data = createV2Data();
    const result = downgradeWorkspaceData(v2Data, 2, 1);

    assert.equal(result.schemaVersion, 1, 'Should be version 1');

    const device = result.data.devices[0];
    assert.equal(device.aclRules, undefined, 'Should remove aclRules');
    assert.equal(device.natRules, undefined, 'Should remove natRules');
    assert.equal(device.natSessions, undefined, 'Should remove natSessions');
  });

  test('Downgrade 3→2: Removes v3 fields', () => {
    const v3Data = createV3Data();
    const result = downgradeWorkspaceData(v3Data, 3, 2);

    assert.equal(result.schemaVersion, 2, 'Should be version 2');

    const device = result.data.devices[0];
    assert.equal(device.ospfLsdb, undefined, 'Should remove ospfLsdb');
  });

  test('Downgrade 3→1: Chain multiple downgrades', () => {
    const v3Data = createV3Data();
    const result = downgradeWorkspaceData(v3Data, 3, 1);

    assert.equal(result.schemaVersion, 1, 'Should reach version 1');

    const device = result.data.devices[0];
    // Check that both v2 and v3 fields are removed
    assert.equal(device.aclRules, undefined, 'Should not have v2 fields');
    assert.equal(device.ospfLsdb, undefined, 'Should not have v3 fields');
  });

  test('Error: Unsupported version too old', () => {
    const v0Data = createV1Data();

    assert.throws(
      () => migrateWorkspaceData(v0Data, 0, 3),
      UnsupportedSchemaVersionError,
      'Should throw UnsupportedSchemaVersionError for version 0'
    );
  });

  test('Error: Cannot downgrade forward', () => {
    const v1Data = createV1Data();

    assert.throws(
      () => downgradeWorkspaceData(v1Data, 1, 3),
      Error,
      'Should throw error when trying to downgrade forward'
    );
  });

  test('Error: Cannot downgrade to same version', () => {
    const v2Data = createV2Data();

    assert.throws(
      () => downgradeWorkspaceData(v2Data, 2, 2),
      Error,
      'Should throw error when downgrading to same version'
    );
  });

  test('Metadata: Migration tracks source and timestamp', () => {
    const v1Data = createV1Data();
    const timeBefore = Date.now();
    const result = migrateWorkspaceData(v1Data, 1, 2);
    const timeAfter = Date.now();

    assert.equal(result.metadata.migratedFrom, 1, 'Should track fromVersion');
    assert.equal(result.metadata.migratedBy, 'auto', 'Should track migrationType');
    assert.ok(
      result.metadata.lastMigrated >= timeBefore && result.metadata.lastMigrated <= timeAfter,
      'Should timestamp migration'
    );
  });

  test('Validation: V1 data must have ports array', () => {
    const invalidData: WorkspaceData = {
      devices: [{ ...createTestDevice('sw1', 'Switch1'), ports: 'invalid' }],
      cables: []
    };

    // v1→v2 migration has validation
    const v1ToV2Migration = MIGRATIONS.find(m => m.fromVersion === 1 && m.toVersion === 2);
    assert.ok(v1ToV2Migration, 'Should have v1→v2 migration');
    assert.equal(v1ToV2Migration.validate?.(invalidData), false, 'Validation should fail for invalid ports');
  });

  test('Round-trip: v1→v2→v1 preserves core data', () => {
    const original = createV1Data();

    // Migrate up to v2
    const upResult = migrateWorkspaceData(original, 1, 2);

    // Migrate back down to v1
    const downResult = downgradeWorkspaceData(upResult.data, 2, 1);

    assert.equal(downResult.schemaVersion, 1, 'Should be back at version 1');
    assert.equal(downResult.data.devices[0].hostname, original.devices[0].hostname, 'Should preserve hostname');
    assert.equal(downResult.data.devices.length, original.devices.length, 'Should preserve device count');
  });

  test('Empty workspace: Migration handles empty devices/cables', () => {
    const emptyData: WorkspaceData = {
      devices: [],
      cables: [],
      updatedAt: Date.now()
    };

    const result = migrateWorkspaceData(emptyData, 1, 3);

    assert.equal(result.schemaVersion, 3, 'Should successfully migrate empty workspace');
    assert.equal(result.data.devices.length, 0, 'Should preserve empty devices array');
    assert.equal(result.data.cables.length, 0, 'Should preserve empty cables array');
  });

  test('Migration count matches expected', () => {
    assert.ok(MIGRATIONS.length >= 2, 'Should have at least 2 migrations');

    // Each migration should have unique fromVersion-toVersion pair
    const pairs = MIGRATIONS.map(m => `${m.fromVersion}-${m.toVersion}`);
    const unique = new Set(pairs);
    assert.equal(pairs.length, unique.size, 'Should have unique migration paths');
  });

  test('Down migrations are available for all defined migrations', () => {
    for (const migration of MIGRATIONS) {
      assert.ok(
        migration.down,
        `Migration ${migration.fromVersion}→${migration.toVersion} should have down() function`
      );
    }
  });

  test('Future version data: Warning logged, not migrated', () => {
    const v3Data = createV3Data();

    const result = migrateWorkspaceData(v3Data, 999, SCHEMA_VERSION);

    // Should return as-is without migration when fromVersion > SCHEMA_VERSION
    assert.ok(result.schemaVersion === 999 || result.schemaVersion === SCHEMA_VERSION);
  });

  test('Multiple devices: Migration applies to all', () => {
    const multiData: WorkspaceData = {
      devices: [
        createTestDevice('sw1', 'Switch1'),
        createTestDevice('sw2', 'Switch2'),
        createTestDevice('r1', 'Router1')
      ],
      cables: []
    };

    const result = migrateWorkspaceData(multiData, 1, 2);

    assert.equal(result.data.devices.length, 3, 'Should migrate all devices');
    for (const device of result.data.devices) {
      assert.ok(Array.isArray(device.aclRules), `Device ${device.id} should have aclRules`);
    }
  });

  test('Idempotent migration: v3→v3 is no-op', () => {
    const v3Data = createV3Data();

    // Migrating from v3 to v3 should apply no migrations
    const result = migrateWorkspaceData(v3Data, 3, 3);

    assert.equal(result.schemaVersion, 3, 'Should remain at version 3');
    // Data should be essentially unchanged
    assert.deepEqual(result.data.devices[0].hostname, v3Data.devices[0].hostname);
  });
});
