/**
 * Persistence Manager for NetSim.dev
 *
 * Provides a robust interface for saving/loading versioned data to/from localStorage.
 * Features:
 * - Automatic schema migration on load
 * - Backup creation before destructive operations
 * - Quota management (automatic cleanup of old data)
 * - Version tracking and recovery
 */

import { SCHEMA_VERSION } from './schemaVersioning.js';
import { migrateWorkspaceData, WorkspaceData, VersionedWorkspaceData } from './schemaMigrations.js';
import { PersistenceError } from './persistenceErrors.js';

/**
 * Storage version info
 */
export interface StorageVersion {
  version: number;
  key: string;
  size: number;
  timestamp?: number;
}

/**
 * Migration log entry
 */
export interface MigrationLogEntry {
  timestamp: number;
  migration: string;
  fromVersion: number;
  toVersion: number;
  success: boolean;
  error?: string;
}

/**
 * Constants
 */
const BACKUP_SUFFIX = '-backup-';
const LOG_KEY = 'netsim-migration-log';
const MAX_BACKUP_VERSIONS = 10;

/**
 * Persistence Manager - Main API for storage operations
 */
export class PersistenceManager {
  /**
   * Save workspace data to localStorage with versioning
   * Automatically wraps data with schema version and metadata
   *
   * @param key Storage key
   * @param data Workspace data to save
   * @param version Schema version (defaults to current)
   * @throws PersistenceError on localStorage failure
   */
  static saveToLocalStorage(
    key: string,
    data: WorkspaceData,
    version: number = SCHEMA_VERSION
  ): void {
    const versioned: VersionedWorkspaceData = {
      schemaVersion: version,
      metadata: {
        lastMigrated: Date.now(),
        migratedFrom: version,
        migratedBy: 'manual'
      },
      data
    };

    try {
      const json = JSON.stringify(versioned);
      localStorage.setItem(key, json);
    } catch (error) {
      // Handle localStorage quota exceeded
      if (error instanceof DOMException && error.code === 22) {
        console.warn('localStorage quota exceeded, attempting cleanup...');
        this.handleQuotaExceeded(key);
        // Retry after cleanup
        try {
          localStorage.setItem(key, JSON.stringify(versioned));
        } catch (retryError) {
          throw new PersistenceError(`Failed to save to localStorage after cleanup: ${key}`, retryError instanceof Error ? retryError : undefined);
        }
      } else {
        throw new PersistenceError(`Failed to save to localStorage: ${key}`, error instanceof Error ? error : undefined);
      }
    }
  }

  /**
   * Load workspace data from localStorage with automatic migration
   * Detects and applies migrations if needed
   *
   * @param key Storage key
   * @returns Versioned data with schema version metadata, or null if not found
   */
  static loadFromLocalStorage(key: string): VersionedWorkspaceData | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);

      // Legacy data without schemaVersion = version 1
      if (!parsed.schemaVersion) {
        console.log(`Detected legacy data (v1) at key: ${key}. Migrating...`);
        return migrateWorkspaceData(parsed, 1, SCHEMA_VERSION);
      }

      // Already at current version
      if (parsed.schemaVersion === SCHEMA_VERSION) {
        return parsed as VersionedWorkspaceData;
      }

      // Older version - needs migration
      if (parsed.schemaVersion < SCHEMA_VERSION) {
        console.log(`Detected v${parsed.schemaVersion} data at key: ${key}. Migrating to v${SCHEMA_VERSION}...`);
        const data = parsed.data || parsed;
        return migrateWorkspaceData(data, parsed.schemaVersion, SCHEMA_VERSION);
      }

      // Future version (app is older than data)
      console.warn(
        `⚠ Data is from future schema version: v${parsed.schemaVersion}. ` +
        `Current app version: v${SCHEMA_VERSION}. Returning as-is without migration.`
      );
      return parsed as VersionedWorkspaceData;
    } catch (error) {
      console.error(`Failed to load from localStorage (${key}):`, error);
      return null;
    }
  }

  /**
   * List all storage versions for a given key prefix
   * Useful for finding all saved sessions or backups
   *
   * @param keyPrefix Base key to search for (e.g. 'netsim-session')
   * @returns Sorted array of versions (newest first)
   */
  static listVersions(keyPrefix: string): StorageVersion[] {
    const versions: StorageVersion[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(keyPrefix)) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            const timestamp = parsed.metadata?.lastMigrated || parsed.createdAt || Date.now();
            versions.push({
              version: parsed.schemaVersion || 1,
              key,
              size: data.length,
              timestamp
            });
          }
        } catch (e) {
          // Skip corrupted entries
          console.warn(`Skipping corrupted localStorage entry: ${key}`);
        }
      }
    }

    // Sort by timestamp descending (newest first)
    return versions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  /**
   * Create a backup of current data before destructive operations
   * Appends timestamp to key to create unique backup
   *
   * @param key Key to backup
   * @param reason Optional description (logged)
   * @returns Backup key if successful, empty string if failed
   */
  static createBackup(key: string, reason: string = 'manual'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupKey = `${key}${BACKUP_SUFFIX}${timestamp}`;
    const data = localStorage.getItem(key);

    if (!data) {
      console.warn(`Cannot create backup: source key not found (${key})`);
      return '';
    }

    try {
      localStorage.setItem(backupKey, data);
      this.logMigration(`Backup created: ${backupKey}`, reason);
      console.log(`✓ Backup created: ${backupKey}`);
      return backupKey;
    } catch (error) {
      console.warn(`Failed to create backup: ${backupKey}`, error);
      return '';
    }
  }

  /**
   * Recover data from a backup
   *
   * @param key Target key to restore to
   * @param backupKey Backup key to restore from
   * @returns True if successful
   */
  static recoverFromBackup(key: string, backupKey: string): boolean {
    try {
      const backup = localStorage.getItem(backupKey);
      if (!backup) {
        console.warn(`Backup not found: ${backupKey}`);
        return false;
      }

      localStorage.setItem(key, backup);
      this.logMigration(`Recovered from backup: ${backupKey}`, 'recovery');
      console.log(`✓ Recovered from backup: ${backupKey}`);
      return true;
    } catch (error) {
      console.error(`Failed to recover from backup:`, error);
      return false;
    }
  }

  /**
   * Delete a backup
   *
   * @param backupKey Key of backup to delete
   */
  static deleteBackup(backupKey: string): boolean {
    try {
      localStorage.removeItem(backupKey);
      console.log(`✓ Backup deleted: ${backupKey}`);
      return true;
    } catch (error) {
      console.warn(`Failed to delete backup: ${backupKey}`, error);
      return false;
    }
  }

  /**
   * Delete backup by keeping only recent ones
   *
   * @param keyPrefix Prefix to search for backups
   * @param keepCount How many to keep (default: MAX_BACKUP_VERSIONS)
   */
  static cleanupOldBackups(keyPrefix: string, keepCount: number = MAX_BACKUP_VERSIONS): number {
    const backupPrefix = `${keyPrefix}${BACKUP_SUFFIX}`;
    const backups = this.listVersions(backupPrefix);

    let deleted = 0;
    const toDelete = backups.slice(keepCount);

    for (const backup of toDelete) {
      if (this.deleteBackup(backup.key)) {
        deleted++;
      }
    }

    if (deleted > 0) {
      console.log(`✓ Cleaned up ${deleted} old backups`);
    }

    return deleted;
  }

  /**
   * Handle localStorage quota exceeded error
   * Attempts to free space by removing old sessions and backups
   *
   * @param excludeKey Key to preserve during cleanup
   */
  private static handleQuotaExceeded(excludeKey: string): void {
    console.warn('Handling localStorage quota exceeded...');

    // Strategy 1: Clean up old backups
    this.cleanupOldBackups('netsim-session', 3);

    // Strategy 2: Remove old session data (keep recent 5)
    const sessions = this.listVersions('netsim-session')
      .filter(v => v.key !== excludeKey);

    const toRemove = sessions.slice(5);
    let removed = 0;

    for (const session of toRemove) {
      try {
        localStorage.removeItem(session.key);
        removed++;
      } catch (e) {
        console.warn(`Failed to remove session: ${session.key}`);
      }
    }

    if (removed > 0) {
      console.log(`✓ Removed ${removed} old sessions to free space`);
    }
  }

  /**
   * Log migration operations for debugging/auditing
   *
   * @param message Log message
   * @param type Type of operation (migration, backup, recovery, etc.)
   */
  private static logMigration(message: string, type: string = 'operation'): void {
    try {
      const logRaw = localStorage.getItem(LOG_KEY);
      const logs: Array<{ timestamp: number; type: string; message: string }> = logRaw
        ? JSON.parse(logRaw)
        : [];

      // Keep only last 100 entries
      logs.push({
        timestamp: Date.now(),
        type,
        message
      });

      const limited = logs.slice(-100);
      localStorage.setItem(LOG_KEY, JSON.stringify(limited));
    } catch (error) {
      console.warn('Failed to log migration:', error);
    }
  }

  /**
   * Get migration history log
   *
   * @returns Array of migration log entries
   */
  static getMigrationLog(): Array<{ timestamp: number; type: string; message: string }> {
    try {
      const logRaw = localStorage.getItem(LOG_KEY);
      return logRaw ? JSON.parse(logRaw) : [];
    } catch (error) {
      console.warn('Failed to read migration log:', error);
      return [];
    }
  }

  /**
   * Clear migration history log
   */
  static clearMigrationLog(): void {
    try {
      localStorage.removeItem(LOG_KEY);
      console.log('✓ Migration log cleared');
    } catch (error) {
      console.warn('Failed to clear migration log:', error);
    }
  }

  /**
   * Validate data structure
   * Returns detailed errors if validation fails
   *
   * @param data Data to validate
   * @returns Validation result with details
   */
  static validateData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data) {
      errors.push('Data is null or undefined');
    } else {
      if (!Array.isArray(data.devices)) {
        errors.push('devices must be an array');
      }
      if (!Array.isArray(data.cables)) {
        errors.push('cables must be an array');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get storage statistics
   */
  static getStorageStats(): {
    totalKeys: number;
    totalSize: number;
    availableSpace: number;
    usagePercent: number;
  } {
    let totalSize = 0;
    let totalKeys = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length;
          totalKeys++;
        }
      }
    }

    // Estimate: localStorage typically ~5-10MB limit
    // Using 5MB (5242880 bytes) as conservative estimate
    const estimatedLimit = 5 * 1024 * 1024;
    const availableSpace = estimatedLimit - totalSize;
    const usagePercent = (totalSize / estimatedLimit) * 100;

    return {
      totalKeys,
      totalSize,
      availableSpace,
      usagePercent: Math.round(usagePercent * 100) / 100
    };
  }

  /**
   * Export all data as JSON string (for backup/debugging)
   */
  static exportData(): string {
    const data: Record<string, any> = {
      exportedAt: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
      stats: this.getStorageStats(),
      data: {}
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('netsim-')) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            data.data[key] = JSON.parse(value);
          } catch {
            data.data[key] = `[corrupted: ${value.substring(0, 100)}...]`;
          }
        }
      }
    }

    return JSON.stringify(data, null, 2);
  }
}
