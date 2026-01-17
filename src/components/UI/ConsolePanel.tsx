import React, { useEffect, useRef, useState } from 'react';
import { useNetworkStore } from '../../store/useNetworkStore';
import { X, Terminal, Send } from 'lucide-react';

export const ConsolePanel = () => {
  const { activeConsoleId, devices, openConsole, executeCommand } = useNetworkStore();
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const device = devices.find(d => d.id === activeConsoleId);

  // Auto-scroll al final
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [device?.consoleLogs]);

  if (!activeConsoleId || !device) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    executeCommand(input);
    setInput('');
  };

  return (
    <div className="w-96 bg-black border-l border-gray-800 flex flex-col font-mono text-sm h-full absolute right-0 top-0 z-50 shadow-2xl">
      {/* Header */}
      <div className="bg-gray-900 p-2 border-b border-gray-800 flex justify-between items-center text-gray-300">
        <div className="flex items-center gap-2">
            <Terminal size={14} />
            <span className="font-bold">{device.hostname} - CLI</span>
        </div>
        <button onClick={() => openConsole(null)} className="hover:text-white"><X size={16} /></button>
      </div>

      {/* Output Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 text-green-500">
        {device.consoleLogs.map((log, i) => (
            <div key={i} className="whitespace-pre-wrap">{log}</div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-2 bg-gray-900 border-t border-gray-800 flex">
        <span className="text-gray-500 mr-2">{`[${device.hostname}]`}</span>
        <input
            id="console-input"
            name="console-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white focus:ring-0"
            autoFocus
            placeholder="Comando (ej: sysname SW1)"
        />
        <button type="submit" className="text-gray-400 hover:text-white"><Send size={14} /></button>
      </form>
    </div>
  );
};
