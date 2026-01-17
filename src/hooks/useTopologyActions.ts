import { useCallback, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNetworkStore } from '../store/useNetworkStore';
import { useDeviceCatalogStore } from '../store/useDeviceCatalogStore';
import { useUiStore } from '../store/useUiStore';

export function useTopologyActions() {
    const {
        devices, cables, activeTrafficParams, removeCable,
        updateDevicePosition, addDevice, openConsole
    } = useNetworkStore();
    const { models } = useDeviceCatalogStore();
    const { role } = useAuthStore();
    const { addToast } = useUiStore();

    const edges = useMemo(() => cables.map(c => {
        const sd = devices.find(d => d.id === c.sourceDeviceId);
        const td = devices.find(d => d.id === c.targetDeviceId);
        const sp = sd?.ports.find(p => p.id === c.sourcePortId);
        const tp = td?.ports.find(p => p.id === c.targetPortId);
        const trunkId = c.trunkId ?? ((sp?.ethTrunkId && sp.ethTrunkId === tp?.ethTrunkId) ? sp.ethTrunkId : undefined);

        let trunkState: 'ok' | 'partial' | undefined = undefined;
        if (trunkId !== undefined) {
            const t1 = sd?.ethTrunks?.find(t => t.id === trunkId && t.enabled);
            const t2 = td?.ethTrunks?.find(t => t.id === trunkId && t.enabled);
            const upPorts = sp?.status === 'up' && tp?.status === 'up';
            const m1 = t1?.mode || 'static';
            const m2 = t2?.mode || 'static';
            const lacpOk = m1 === 'static' || m2 === 'static' || m1 === 'active' || m2 === 'active';
            trunkState = t1 && t2 && upPorts && lacpOk ? 'ok' : 'partial';
        }

        const trafficActive = activeTrafficParams.includes(c.id) || (sd?.ospfEnabled && td?.ospfEnabled);
        const label = sp && tp ? `${sp.name} ↔ ${tp.name}` : undefined;

        return {
            id: c.id,
            source: c.sourceDeviceId,
            target: c.targetDeviceId,
            sourceHandle: `${c.sourcePortId}-s`, // Use handle ID suffix to match NetworkNode
            targetHandle: `${c.targetPortId}-t`,
            type: 'smart',
            data: {
                type: c.type,
                trunkId,
                trunkState,
                trafficActive,
                label,
                sourcePortName: sp?.name || '?',
                targetPortName: tp?.name || '?'
            },
            zIndex: 1000
        };
    }), [cables, devices, activeTrafficParams]);

    const onEdgeDoubleClick = useCallback((_: any, edge: any) => {
        removeCable(edge.id);
    }, [removeCable]);

    const onNodesChange = useCallback((nds: any[]) => {
        nds.forEach(n => {
            if (n.type === 'position' && n.position) {
                updateDevicePosition(n.id, n.position);
            }
        });
    }, [updateDevicePosition]);

    const handleAddDevice = useCallback((modelId: string, position?: { x: number; y: number }) => {
        const model = (models || []).find(m => m.model === modelId);
        if (!model) return;

        if (role === 'basic' && devices.length >= 5) {
            addToast('Limit of 5 nodes for Basic plans reached', 'error');
            return;
        }

        const newDevice = addDevice(model.model, position);

        openConsole(newDevice.id);
        addToast(`${model.displayName} added to the topology`, 'success');
    }, [models, devices.length, role, addDevice, addToast, openConsole]);

    const handleOpenDeviceConsole = useCallback((deviceId: string) => {
        openConsole(deviceId);
    }, [openConsole]);

    return {
        edges,
        onEdgeDoubleClick,
        onNodesChange,
        handleAddDevice,
        handleOpenDeviceConsole,
        devices
    };
}
