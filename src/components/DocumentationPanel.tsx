import { useEffect, useState } from "react";
import { documentationSections, DocumentationEntry } from "../data/documentation";
import { BookOpen, Command, Layers, ScrollText, ChevronDown, Sparkles } from "lucide-react";
import { useNetworkStore } from "../store/useNetworkStore";
import { CliVendorProfileId, getVendorProfile, vendorProfilesList } from "../utils/cliProfiles";

type VendorFilterOption = "all" | CliVendorProfileId;

export function DocumentationPanel() {
  const { activeConsoleId, devices, activeVendorProfileId } = useNetworkStore();
  const device = devices.find(d => d.id === activeConsoleId);
  const [vendorFilter, setVendorFilter] = useState<VendorFilterOption>("all");
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['commands']));

  const fallbackVendor = device ? getVendorProfile(device.vendor, device.model) : vendorProfilesList[0];
  const activeVendorProfile =
    vendorProfilesList.find(profile => profile.id === activeVendorProfileId) ?? fallbackVendor;

  useEffect(() => {
    if (activeVendorProfileId) {
      setVendorFilter(activeVendorProfileId);
    } else {
      setVendorFilter("all");
    }
  }, [activeVendorProfileId]);

  const matchesVendorFilter = (entry: DocumentationEntry) => {
    if (vendorFilter === "all") return true;
    const entryVendors = entry.vendors ?? ["huawei"];
    return entryVendors.includes(vendorFilter) || entryVendors.includes("all");
  };

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filterButtons: VendorFilterOption[] = ["all", ...vendorProfilesList.map(profile => profile.id)];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-accent-500/20 border border-accent-500/30">
          <BookOpen size={16} className="text-accent-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Documentation</h3>
          <p className="text-[10px] text-zinc-500">Command reference and guides</p>
        </div>
      </div>

      {/* Vendor Filter - Premium Pills */}
      <div className="glass-subtle rounded-xl p-3 border border-white/[0.06]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] text-zinc-500 uppercase tracking-[0.2em]">Filter by vendor</span>
          <span className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
        </div>
        <div className="flex flex-wrap gap-2">
          {filterButtons.map(option => {
            const label = option === "all" ? "All" : vendorProfilesList.find(profile => profile.id === option)?.label ?? option;
            const isActive = vendorFilter === option;
            return (
              <button
                key={option}
                onClick={() => setVendorFilter(option)}
                aria-pressed={isActive}
                className={`
                  text-[10px] px-3 py-1.5 rounded-lg font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-accent-500/20 text-accent-300 border border-accent-500/40 shadow-neon-accent'
                    : 'bg-black/20 text-zinc-500 border border-white/[0.06] hover:text-zinc-300 hover:border-white/20'
                  }
                `}
              >
                {label}
              </button>
            );
          })}
        </div>
        {activeVendorProfile && (
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/[0.06]">
            <Sparkles size={12} className="text-neon-green" />
            <span className="text-[10px] text-zinc-400">
              Active console: <span className="text-neon-green font-semibold">{activeVendorProfile.label}</span>
            </span>
          </div>
        )}
      </div>

      {/* Documentation Sections - Animated Accordions */}
      <div className="space-y-2">
        {documentationSections.map((section) => {
          const Icon =
            section.id === "commands" ? Command
              : section.id === "features" ? Layers
                : section.id === "labs" ? ScrollText
                  : BookOpen;

          const isOpen = openSections.has(section.id);
          const filteredEntries = section.entries.filter(matchesVendorFilter);

          if (filteredEntries.length === 0) return null;

          return (
            <div
              key={section.id}
              className="glass-card rounded-xl overflow-hidden border-glow"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className={`
                  p-2 rounded-lg transition-all duration-300
                  ${isOpen
                    ? 'bg-accent-500/20 border border-accent-500/30'
                    : 'bg-white/[0.03] border border-white/[0.06]'
                  }
                `}>
                  <Icon size={16} className={isOpen ? 'text-accent-400' : 'text-zinc-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{section.title}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{section.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-zinc-600 bg-white/[0.03] px-2 py-0.5 rounded-full">
                    {filteredEntries.length}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {/* Section Content */}
              <div className={`
                transition-all duration-300 ease-out overflow-hidden
                ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
              `}>
                <div className="px-4 pb-4 space-y-2 border-t border-white/[0.04]">
                  {filteredEntries.map(entry => (
                    <article
                      key={entry.name}
                      className="group bg-black/30 border border-white/[0.04] rounded-lg p-3 space-y-2 transition-all hover:border-accent-400/30 hover:bg-black/40"
                    >
                      {/* Entry Header */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="text-[12px] font-semibold text-white group-hover:text-accent-300 transition-colors">
                          {entry.name}
                        </div>
                        {entry.meta && (
                          <span className="text-[9px] text-neon-green font-mono bg-neon-green/10 border border-neon-green/30 px-2 py-0.5 rounded-full">
                            {entry.meta}
                          </span>
                        )}
                      </div>

                      {/* Entry Description */}
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{entry.description}</p>

                      {/* Entry Example */}
                      {entry.example && (
                        <div className="text-[10px] font-mono text-accent-300/80 bg-accent-500/5 border border-accent-500/20 px-3 py-2 rounded-lg">
                          <span className="text-zinc-500">$ </span>{entry.example}
                        </div>
                      )}

                      {/* Entry Extra Tags */}
                      {entry.extra && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {entry.extra.map((item, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] text-zinc-500 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-full"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="flex items-center gap-2 text-[10px] text-zinc-600 pt-2">
        <div className="w-1 h-1 rounded-full bg-accent-500/50" />
        <span>Live reference for users and instructors</span>
      </div>
    </div>
  );
}
