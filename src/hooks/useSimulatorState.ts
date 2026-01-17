import { useState, useCallback } from 'react';

export function useSimulatorState() {
    const [sidebarTab, setSidebarTab] = useState<'quick' | 'devices' | 'labs' | 'status' | 'storage' | 'documentation'>('devices');
    const [search, setSearch] = useState('');
    const [showMiniMap, setShowMiniMap] = useState(true);
    const [showLabsPanel, setShowLabsPanel] = useState(false);
    const [hotkeysModal, setHotkeysModal] = useState({ isOpen: false, open: () => setHotkeysModal(v => ({ ...v, isOpen: true })), close: () => setHotkeysModal(v => ({ ...v, isOpen: false })) });
    const [sidebarSections, setSidebarSections] = useState({ favorites: true, recent: true, filters: true });

    const toggleSection = useCallback((section: keyof typeof sidebarSections) => {
        setSidebarSections(prev => ({ ...prev, [section]: !prev[section] }));
    }, []);

    return {
        sidebarTab,
        setSidebarTab,
        search,
        setSearch,
        showMiniMap,
        setShowMiniMap,
        showLabsPanel,
        setShowLabsPanel,
        hotkeysModal,
        sidebarSections,
        toggleSection,
    };
}
