import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNetworkStore } from '../store/useNetworkStore';
// import { useConfigStore } from '../store/useConfigStore';
import { getVendorBaseSuggestions, getVendorProfile } from '../utils/cliProfiles';
import {
  X, Terminal, Sparkles, Copy, Check,
  GripVertical, Trash2, Download, Maximize2, Minimize2, Monitor
} from 'lucide-react';
import { cn } from '../utils/cn';
import { Badge } from './UI/Badge';

// Syntax highlighting for CLI output
function highlightSyntax(text: string): React.ReactNode {
  // Keywords
  const keywords = /\b(interface|vlan|ip|address|mask|enable|disable|shutdown|no|display|system-view|quit|return|ospf|area|network|router-id|stp|port|trunk|access|hybrid|pvid|allowed|pass|vrrp|priority|preempt|eth-trunk|mode|lacp|commit|abort|candidate-configuration|running-config|current-configuration)\b/gi;

  // IP addresses
  const ipPattern = /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,2})?)\b/g;

  // Interface names
  const interfaces = /\b(GigabitEthernet|GE|XGigabitEthernet|XGE|Vlanif|Eth-Trunk|LoopBack|Ethernet|FastEthernet|Serial)\d*\/?\d*\/?\d*/gi;

  // Status words
  const statusUp = /\b(up|enabled|active|forwarding|master|ESTABLISHED|FULL)\b/gi;
  const statusDown = /\b(down|disabled|inactive|discarding|backup|blocked|INIT|EXSTART|DOWN)\b/gi;

  // Split by lines for processing
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    // Simple token-based highlighting
    const tokens = line.split(/(\s+)/);

    return (
      <div key={lineIndex} className="leading-tight break-all whitespace-pre-wrap py-0.5">
        {tokens.map((token, tokenIndex) => {
          if (!token) return null;

          if (keywords.test(token)) {
            return <span key={tokenIndex} className="text-netsim-cyan font-bold drop-shadow-[0_0_8px_rgba(41,217,255,0.3)]">{token}</span>;
          }
          if (ipPattern.test(token)) {
            return <span key={tokenIndex} className="text-netsim-purple font-medium">{token}</span>;
          }
          if (interfaces.test(token)) {
            return <span key={tokenIndex} className="text-blue-400 font-semibold">{token}</span>;
          }
          if (statusUp.test(token)) {
            return <span key={tokenIndex} className="text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">{token}</span>;
          }
          if (statusDown.test(token)) {
            return <span key={tokenIndex} className="text-rose-400 font-bold bg-rose-500/10 px-1 rounded">{token}</span>;
          }
          if (token.startsWith('#') || token.startsWith('!')) {
            return <span key={tokenIndex} className="text-zinc-600 italic">{token}</span>;
          }
          if (token.toLowerCase().includes('error')) {
            return <span key={tokenIndex} className="text-white font-black bg-rose-600 px-1 rounded animate-pulse">{token}</span>;
          }
          if (token.toLowerCase().includes('warning')) {
            return <span key={tokenIndex} className="text-amber-400 border-b border-amber-400/30">{token}</span>;
          }
          return <span key={tokenIndex} className="text-zinc-300">{token}</span>;
        })}
      </div>
    );
  });
}

interface AutocompleteItem {
  command: string;
  description?: string;
  category?: string;
}

const commandDescriptions: Record<string, string> = {
  'display ip interface brief': 'IP interface summary',
  'display vlan': 'VLAN list',
  'display stp brief': 'STP status',
  'display ospf peer': 'OSPF neighbors',
  'display current-configuration': 'Current configuration',
  'display ip routing-table': 'Routing table',
  'system-view': 'Enter configuration',
  'quit': 'Go back',
  'commit': 'Confirm changes (Candidate)',
  'abort': 'Discard changes (Candidate)',
  'display candidate-configuration': 'View pending changes',
  'interface': 'Configure interface'
};

export default function Console() {
  const {
    activeConsoleId, openConsoleIds, devices,
    executeCommand, openConsole, closeConsole,
    setActiveVendorProfile, clearConsoleLogs
  } = useNetworkStore();

  const [input, setInput] = useState('');
  const [matches, setMatches] = useState<AutocompleteItem[]>([]);
  const [matchIndex, setMatchIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [ghostSuggestion, setGhostSuggestion] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [panelWidth, setPanelWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);
  const [isFullHeight, setIsFullHeight] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeDevice = devices.find(d => d.id === activeConsoleId);
  // const { features } = useConfigStore();

  const historyKey = useMemo(() => activeConsoleId ? `netsim - cli - history - ${activeConsoleId} ` : null, [activeConsoleId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeDevice?.consoleLogs]);

  // Load history from localStorage
  useEffect(() => {
    if (!historyKey) return;
    try {
      const raw = localStorage.getItem(historyKey);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [historyKey]);

  // Sync profile
  useEffect(() => {
    if (activeDevice) {
      const profile = getVendorProfile(activeDevice.vendor, activeDevice.model);
      setActiveVendorProfile(profile.id);
    }
  }, [activeDevice, setActiveVendorProfile]);

  const vendorProfile = useMemo(() =>
    activeDevice ? getVendorProfile(activeDevice.vendor, activeDevice.model) : null,
    [activeDevice]
  );

  const baseSuggestions = useMemo(() => {
    if (!vendorProfile || !activeDevice?.cliState.view) return [];
    return getVendorBaseSuggestions(vendorProfile, activeDevice.cliState.view);
  }, [vendorProfile, activeDevice?.cliState.view]);

  // Autocomplete & Ghost Suggestion
  useEffect(() => {
    if (!input.trim()) {
      setMatches([]);
      setShowDropdown(false);
      setGhostSuggestion(null);
      return;
    }
    const prefix = input.toLowerCase();
    const list = baseSuggestions
      .filter(cmd => cmd.toLowerCase().startsWith(prefix))
      .slice(0, 8)
      .map(cmd => ({
        command: cmd,
        description: commandDescriptions[cmd]
      }));

    setMatches(list);
    setMatchIndex(0);
    setShowDropdown(list.length > 0 && input.length > 2);

    if (list.length > 0) {
      const firstMatch = list[0].command;
      if (firstMatch.toLowerCase().startsWith(input.toLowerCase())) {
        setGhostSuggestion(firstMatch.slice(input.length));
      } else {
        setGhostSuggestion(null);
      }
    } else {
      setGhostSuggestion(null);
    }
  }, [input, baseSuggestions]);


  if (!activeConsoleId && openConsoleIds.length === 0) return null;

  const persistHistory = (next: string[]) => {
    setHistory(next);
    if (historyKey) localStorage.setItem(historyKey, JSON.stringify(next.slice(-50)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    executeCommand(input);
    persistHistory([...(history || []), input]);
    setInput('');
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' || e.key === 'ArrowRight') {
      if (ghostSuggestion) {
        e.preventDefault();
        setInput(input + ghostSuggestion);
        setGhostSuggestion(null);
      } else if (matches.length > 0) {
        e.preventDefault();
        setInput(matches[matchIndex].command);
        setShowDropdown(false);
      }
    } else if (e.key === 'ArrowDown') {
      if (showDropdown) {
        e.preventDefault();
        setMatchIndex(prev => (prev + 1) % matches.length);
      }
    } else if (e.key === 'ArrowUp') {
      if (showDropdown) {
        e.preventDefault();
        setMatchIndex(prev => (prev - 1 + matches.length) % matches.length);
      }
    } else if (e.key === 'Enter' && showDropdown) {
      e.preventDefault();
      setInput(matches[matchIndex].command);
      setShowDropdown(false);
    } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      clearLogs();
    } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setInput('');
    }
  };

  const clearLogs = () => {
    if (activeConsoleId) {
      clearConsoleLogs(activeConsoleId);
    }
  };

  const downloadConfig = () => {
    if (!activeDevice) return;
    const blob = new Blob([activeDevice.consoleLogs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDevice.hostname} _session.log`;
    a.click();
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      setPanelWidth(Math.max(400, Math.min(1000, newWidth)));
    };
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div
      className={cn(
        "flex flex-col bg-[#0b0c0d]/95 backdrop-blur-xl font-mono text-[13px] border-l border-white/[0.08] relative shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-all",
        isFullHeight ? "h-screen" : "h-full"
      )}
      style={{ width: panelWidth }}
    >
      {/* Network Cable Background Decorator */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-netsim-cyan/5 blur-[120px] pointer-events-none rounded-full -mr-32 -mt-32" />

      {/* Resize Handle */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize group z-50 hover:bg-netsim-cyan/50 transition-colors",
          isResizing && "bg-netsim-cyan"
        )}
        onMouseDown={handleResizeStart}
      >
        <div className="absolute top-1/2 -left-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 items-center bg-netsim-cyan/20 p-1 rounded-full backdrop-blur-md">
          <GripVertical size={14} className="text-netsim-cyan" />
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex bg-black/[0.15] border-b border-white/[0.05] overflow-x-auto no-scrollbar backdrop-blur-md">
        {openConsoleIds.map(id => {
          const dev = devices.find(d => d.id === id);
          if (!dev) return null;
          const isActive = id === activeConsoleId;

          return (
            <div
              key={id}
              onClick={() => openConsole(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 min-w-[150px] max-w-[220px] cursor-pointer border-r border-white/[0.05] transition-all relative group",
                isActive
                  ? "bg-white/[0.05] text-white"
                  : "text-zinc-500 hover:bg-white/[0.02] hover:text-zinc-300"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-netsim-cyan shadow-[0_0_10px_rgba(41,217,255,0.5)]" />
              )}
              <div className={cn(
                "w-2 h-2 rounded-full",
                isActive ? "bg-netsim-cyan animate-pulse shadow-[0_0_8px_rgba(41,217,255,0.8)]" : "bg-zinc-700"
              )} />
              <span className={cn("truncate flex-1 font-bold tracking-tight text-[11px] uppercase", isActive ? "text-white" : "text-zinc-500")}>
                {dev.hostname}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); closeConsole(id); }}
                className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-1 rounded-lg hover:bg-white/5 transition-all"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Breadcrumbs & Actions Area */}
      {activeDevice && (
        <div className="flex justify-between items-center px-5 py-3 bg-white/[0.02] border-b border-white/[0.05] relative overflow-hidden">
          <div className="flex items-center gap-3 text-[10px] z-10">
            <div className="flex items-center gap-2 px-2 py-1 bg-black/40 rounded-lg border border-white/[0.05]">
              <Monitor size={10} className="text-netsim-cyan" />
              <span className="text-zinc-400 font-bold uppercase tracking-wider">{activeDevice.hostname}</span>
            </div>
            <span className="text-zinc-700 font-black">/</span>
            <div className="flex items-center px-2 py-1 bg-netsim-cyan/5 rounded-lg border border-netsim-cyan/10">
              <span className="text-netsim-cyan font-black uppercase">{activeDevice.cliState.view}</span>
            </div>
            {activeDevice.cliState.currentInterfaceId && (
              <>
                <span className="text-zinc-700 font-black">/</span>
                <div className="flex items-center px-2 py-1 bg-netsim-purple/5 rounded-lg border border-netsim-purple/10">
                  <span className="text-netsim-purple font-black uppercase">{activeDevice.cliState.currentInterfaceId}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-5 z-10">
            <Badge variant="cyan" size="sm" dot glow className="bg-netsim-cyan/10 border-netsim-cyan/20">
              {vendorProfile?.label || 'GE-HUAWEI'}
            </Badge>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              <button onClick={clearLogs} className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all" title="Clear session">
                <Trash2 size={14} />
              </button>
              <button onClick={() => setIsFullHeight(!isFullHeight)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all" title="Full screen">
                {isFullHeight ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button onClick={downloadConfig} className="p-1.5 rounded-lg text-zinc-500 hover:text-netsim-cyan hover:bg-netsim-cyan/10 transition-all" title="Export logs">
                <Download size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Output Area */}
      <div
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto space-y-1 custom-scrollbar scroll-smooth relative"
      >
        {!activeDevice ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-6 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full animate-pulse bg-netsim-cyan/5 blur-xl" />
              <Terminal size={48} className="text-netsim-cyan drop-shadow-[0_0_15px_rgba(41,217,255,0.4)]" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-black tracking-[0.2em] uppercase text-zinc-400">System Standby</p>
              <p className="text-[10px] text-zinc-600 font-bold uppercase">Select a node to establish a terminal session</p>
            </div>
          </div>
        ) : (
          <div className="reveal-animation">
            <div className="text-[11px] text-zinc-500 mb-8 p-4 glass-card border-l-netsim-cyan/50 bg-netsim-cyan/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-netsim-cyan font-black tracking-widest text-xs">NETSIM CLI OS v2.5.0_SUPRA</span>
                <span className="text-[9px] font-bold border border-white/10 px-2 py-0.5 rounded-full">{activeDevice.vendor.toUpperCase()} PLATFORM</span>
              </div>
              <div className="flex flex-col gap-1 text-[10px]">
                <p className="opacity-80">CONNECTED: <span className="text-white">{new Date().toLocaleString()}</span></p>
                <p className="opacity-80">ENCRYPTION: <span className="text-emerald-500 font-bold">AES-256 GCM</span></p>
                <p className="mt-2 text-zinc-300">Type &quot;?&quot; for help, &quot;display this&quot; for context-aware configuration.</p>
              </div>
            </div>

            {activeDevice.consoleLogs.map((log, i) => (
              <div key={i} className="group relative animate-fade-in-up hover:bg-white/[0.02] transition-colors rounded px-2 -mx-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(log);
                    setCopiedIndex(i);
                    setTimeout(() => setCopiedIndex(null), 2000);
                  }}
                  className="absolute -left-3 top-1 opacity-0 group-hover:opacity-100 transition-all text-zinc-600 hover:text-netsim-cyan p-1 bg-[#0b0c0d] rounded border border-white/10 shadow-xl"
                >
                  {copiedIndex === i ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                </button>
                <div className={cn(
                  "pl-3 border-l-2 py-1",
                  log.toLowerCase().includes('error') ? "border-rose-900/50" : "border-transparent"
                )}>
                  {highlightSyntax(log)}
                </div>
              </div>
            ))}

            {/* Input Form Floating at bottom */}
            <div className="mt-12 mb-8 glass-panel p-4 sticky bottom-2">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-netsim-cyan font-black text-lg leading-none animate-pulse">
                      {activeDevice.cliState.view === 'user-view' ? '>' : '#'}
                    </span>
                  </div>

                  <div className="flex-1 relative flex items-center">
                    <input
                      ref={inputRef}
                      autoFocus
                      className="w-full bg-transparent border-none outline-none text-white focus:ring-0 placeholder-zinc-800 py-2 text-[14px] font-bold tracking-tight"
                      placeholder="Establish command sequence..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoComplete="off"
                    />

                    {/* Ghost Suggestion */}
                    {ghostSuggestion && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-700 py-2 text-[14px] font-bold tracking-tight">
                        <span className="invisible">{input}</span>
                        <span>{ghostSuggestion}</span>
                        <span className="ml-3 text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-zinc-500">TAB</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                    </div>
                  </div>
                </div>

                {/* Suggestion Dropdown (Enhanced) */}
                {showDropdown && (
                  <div className="absolute bottom-full left-0 right-0 mb-4 glass-panel overflow-hidden z-50 animate-scale-in">
                    <div className="bg-netsim-cyan/10 px-4 py-2 text-[9px] uppercase font-black text-netsim-cyan tracking-widest border-b border-netsim-cyan/20 flex justify-between">
                      <span>Command Matches</span>
                      <span className="opacity-60 text-[8px]">Arrow keys to select • Enter to confirm</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {matches.map((m, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex justify-between items-center px-4 py-3 cursor-pointer transition-all border-l-2",
                            idx === matchIndex
                              ? "bg-netsim-cyan/10 border-netsim-cyan text-white translate-x-1"
                              : "border-transparent text-zinc-500 hover:bg-white/[0.02] hover:text-zinc-300"
                          )}
                          onClick={() => {
                            setInput(m.command);
                            setShowDropdown(false);
                            inputRef.current?.focus();
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {idx === matchIndex && <Sparkles size={12} className="text-netsim-cyan animate-pulse" />}
                            <span className="font-black text-sm">{m.command}</span>
                          </div>
                          <span className={cn(
                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                            idx === matchIndex ? "bg-netsim-cyan text-black" : "bg-white/5 text-zinc-600"
                          )}>
                            {m.description || 'Native'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Bar (Enhanced) */}
                <div className="flex items-center gap-3 border-t border-white/[0.05] pt-3">
                  <div className="ml-auto flex items-center gap-4 text-[9px] text-zinc-600 font-bold tracking-widest uppercase">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                      TERMINAL_READY
                    </span>
                    <span>SESSION_TOKEN: <span className="text-zinc-400">NS-{activeDevice.id.slice(0, 6).toUpperCase()}</span></span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Status Bar */}
      <div className="px-5 py-2 bg-black/40 backdrop-blur-xl border-t border-white/[0.05] flex justify-between items-center text-[9px] text-zinc-500 font-black uppercase tracking-[0.15em]">
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <div className="animate-traffic-flow bg-netsim-cyan h-[2px] w-8 rounded-full" />
            <span>SYNC_NORMAL</span>
          </div>
          <span className="text-zinc-800">|</span>
          <span>Buffer: <span className="text-zinc-300">{activeDevice?.consoleLogs.length || 0}</span> / 1000</span>
        </div>
        <div className="flex gap-5">
          <span className="text-netsim-cyan drop-shadow-[0_0_5px_rgba(41,217,255,0.3)]">VRP ARCHITECTURE</span>
          <span className="text-zinc-700">|</span>
          <span className="hover:text-white cursor-pointer transition-colors group">
            Ctrl+K <span className="text-zinc-800 group-hover:text-zinc-500 transition-colors">Clear</span>
          </span>
        </div>
      </div>
    </div>
  );
}
