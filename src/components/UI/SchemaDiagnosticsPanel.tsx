import { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  AlertTriangle,
  ArrowUp,
  Clock
} from 'lucide-react';
import { PersistenceManager, StorageVersion } from '../../utils/persistenceManager';
import { SCHEMA_VERSION, MIN_SUPPORTED_VERSION } from '../../utils/schemaVersioning';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../utils/cn';
import { Tooltip } from './Tooltip';
import { Button } from '../shadcn-ui/button';

interface SchemaDiagnosticsPanelProps {
  onNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
}

/**
 * Technical Diagnostics Panel - Pure Tailwind implementation.
 * Manages local storage versions, backups, and schema migrations.
 */
export function SchemaDiagnosticsPanel({ onNotification }: SchemaDiagnosticsPanelProps) {
  const [versions, setVersions] = useState<StorageVersion[]>([]);
  const [backups, setBackups] = useState<StorageVersion[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [storageStats, setStorageStats] = useState<{ totalKeys: number; totalSize: number; usagePercent: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const notify = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (onNotification) onNotification(message, type);
    else console.log(`[${type}] ${message}`);
  }, [onNotification]);

  const { activeUser } = useAuthStore();
  const sessionPrefix = activeUser ? `netsim-session-${activeUser}` : null;

  const loadStorageData = useCallback(() => {
    setIsLoading(true);
    try {
      if (!sessionPrefix) {
        setVersions([]);
        setBackups([]);
        setStorageStats(null);
        return;
      }
      const allVersions = PersistenceManager.listVersions(sessionPrefix);
      const stats = PersistenceManager.getStorageStats();

      setVersions(allVersions.filter(v => !v.key.includes('-backup-')));
      setBackups(allVersions.filter(v => v.key.includes('-backup-')));
      setStorageStats(stats);
    } catch (error) {
      notify('Error loading data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [notify, sessionPrefix]);

  useEffect(() => {
    loadStorageData();
  }, [loadStorageData]);

  const handleCreateBackup = useCallback(() => {
    if (!selectedKey) return;
    const backupKey = PersistenceManager.createBackup(selectedKey, 'manual');
    if (backupKey) {
      notify(`Backup successful`, 'success');
      loadStorageData();
    }
  }, [selectedKey, notify, loadStorageData]);

  const handleRestoreFromBackup = useCallback((backupKey: string) => {
    if (!selectedKey) return;
    const success = PersistenceManager.recoverFromBackup(selectedKey, backupKey);
    if (success) {
      notify('Restored!', 'success');
      loadStorageData();
    }
  }, [selectedKey, notify, loadStorageData]);

  const handleMigrateToLatest = useCallback(() => {
    if (!selectedKey) return;
    const selectedVersion = versions.find(v => v.key === selectedKey);
    if (!selectedVersion || selectedVersion.version >= SCHEMA_VERSION) return;

    try {
      PersistenceManager.createBackup(selectedKey, 'pre-migration');
      const data = PersistenceManager.loadFromLocalStorage(selectedKey);
      if (data) {
        PersistenceManager.saveToLocalStorage(selectedKey, data.data, SCHEMA_VERSION);
        notify(`Migrated to v${SCHEMA_VERSION}`, 'success');
        loadStorageData();
      }
    } catch (error) {
      notify('Migration failed', 'error');
    }
  }, [selectedKey, versions, notify, loadStorageData]);

  const handleExportData = () => {
    try {
      const exportData = PersistenceManager.exportData();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `netsim-export.json`;
      a.click();
      notify('Export ready', 'success');
    } catch { notify('Error export', 'error'); }
  };

  const selectedVersionData = versions.find(v => v.key === selectedKey);

  return (
    <div className="p-4 flex flex-col gap-5">
      {/* Header Stat */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-accent-400" />
            <span className="text-sm font-bold text-white">Schema & Storage</span>
          </div>
          <button
            onClick={loadStorageData}
            className={cn('p-1.5 rounded-lg transition-colors', isLoading ? 'text-accent-400' : 'text-zinc-500 hover:text-white')}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-zinc-500 block">Current Schema</span>
              <span className="text-sm font-bold font-mono text-white">v{SCHEMA_VERSION}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block">Minimum</span>
              <span className="text-sm font-bold font-mono text-white">v{MIN_SUPPORTED_VERSION}</span>
            </div>
          </div>
          {storageStats && (
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] font-bold text-zinc-500">LOCALSTORAGE USAGE</span>
                <span className={cn('text-[10px]', storageStats.usagePercent > 80 ? 'text-red-400' : 'text-zinc-500')}>
                  {storageStats.usagePercent.toFixed(1)}%
                </span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', storageStats.usagePercent > 80 ? 'bg-red-500' : 'bg-accent-500')}
                  style={{ width: `${Math.min(storageStats.usagePercent, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Versions List */}
      <div>
        <span className="text-[10px] font-bold text-zinc-500 tracking-widest block mb-2">SAVED SESSIONS</span>
        <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
          {versions.length === 0 ? (
            <p className="p-4 text-center text-xs text-zinc-500 italic">No local sessions found</p>
          ) : (
            versions.map((v, i) => (
              <button
                key={v.key}
                onClick={() => setSelectedKey(v.key)}
                className={cn(
                  'w-full py-3 px-4 flex items-center gap-3 text-left transition-colors',
                  i < versions.length - 1 && 'border-b border-white/[0.03]',
                  selectedKey === v.key ? 'bg-blue-500/10' : 'hover:bg-white/5'
                )}
              >
                <div className={cn('w-2 h-2 rounded-full', v.version === SCHEMA_VERSION ? 'bg-green-500' : 'bg-amber-500')} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{v.key.split('-').pop()}</p>
                  <p className="text-[10px] font-mono text-zinc-500">v{v.version} • {(v.size / 1024).toFixed(1)} KB</p>
                </div>
                {v.version < SCHEMA_VERSION && <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Contextual Actions */}
      {selectedKey && selectedVersionData && (
        <div className="p-4 bg-blue-500/[0.03] border border-blue-500/10 rounded-xl">
          <span className="text-xs font-bold text-blue-400 block mb-3">VERSION MANAGEMENT</span>
          <div className="flex flex-col gap-2">
            {selectedVersionData.version < SCHEMA_VERSION && (
              <Button size="sm" variant="default" onClick={handleMigrateToLatest} className="w-full">
                <ArrowUp size={14} className="mr-2" />
                Migrate to v{SCHEMA_VERSION}
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={handleCreateBackup} className="w-full">
              <Download size={14} className="mr-2" />
              Create Manual Backup
            </Button>
          </div>
        </div>
      )}

      {/* Backups Section */}
      {backups.length > 0 && (
        <div>
          <span className="text-[10px] font-bold text-zinc-500 tracking-widest block mb-2">AVAILABLE BACKUPS</span>
          <div className="flex flex-col gap-2">
            {backups.map(b => (
              <div
                key={b.key}
                className="p-3 flex items-center justify-between bg-amber-500/[0.03] border border-amber-500/10 rounded-xl"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Clock size={12} className="text-amber-400 flex-shrink-0" />
                  <span className="text-[10px] font-semibold text-zinc-300 truncate max-w-[120px]">
                    {b.key.split('-backup-')[1]}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Tooltip content="Restore">
                    <button onClick={() => handleRestoreFromBackup(b.key)} className="p-1.5 rounded hover:bg-amber-500/20 text-amber-500 transition-colors">
                      <Upload size={12} />
                    </button>
                  </Tooltip>
                  <button onClick={() => notify('Confirm delete!', 'info')} className="p-1.5 rounded hover:bg-red-500/20 text-red-500 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <Button variant="ghost" onClick={handleExportData} className="w-full py-3 bg-white/5 hover:bg-white/10">
        <Download size={16} className="mr-2" />
        Export Security JSON
      </Button>
    </div>
  );
}
