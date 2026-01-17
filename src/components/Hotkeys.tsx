import { useEffect } from 'react';
import { useReactFlow } from 'reactflow';

interface HotkeysProps {
    onAddSwitch: () => void;
}

export default function Hotkeys({ onAddSwitch }: HotkeysProps) {
    const rf = useReactFlow();

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
                e.preventDefault();
                onAddSwitch();
            } else if (e.ctrlKey && e.key === '0') {
                e.preventDefault();
                rf.fitView();
            } else if (e.ctrlKey && e.key === '=') {
                e.preventDefault();
                rf.zoomIn();
            } else if (e.ctrlKey && e.key === '-') {
                e.preventDefault();
                rf.zoomOut();
            } else if (e.ctrlKey && e.key.toLowerCase() === 'a') {
                const target = e.target as HTMLElement;
                if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return;

                e.preventDefault();
                rf.setNodes(nds => nds.map(n => ({ ...n, selected: true })));
                rf.setEdges(eds => eds.map(e => ({ ...e, selected: true })));
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [rf, onAddSwitch]);

    return null;
}
