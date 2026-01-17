import { NetworkDevice } from '../../../types/NetworkTypes';
import { useNetworkStore } from '../../../store/useNetworkStore';

export const DeviceFaceplate = ({ device }: { device: NetworkDevice }) => {
    // Determine port count - simplified logic based on model
    const isRouter = device.vendor === 'Router' || device.model.includes('Router') || device.model.includes('AR') || device.model.includes('ISR');
    const isPC = device.model === 'PC';
    const isSwitch = !isRouter && !isPC;

    // Mock ports configuration
    const ports = [];
    if (isRouter) {
        ports.push({ name: 'GE0/0/0', type: 'rj45' });
        ports.push({ name: 'GE0/0/1', type: 'rj45' });
        ports.push({ name: 'Console', type: 'console' });
    } else if (isSwitch) {
        for (let i = 1; i <= 24; i++) ports.push({ name: `GE0/0/${i}`, type: 'rj45' });
        ports.push({ name: 'Console', type: 'console' });
    } else {
        ports.push({ name: 'Eth0', type: 'rj45' });
    }

    // Get connection status from store
    const cables = useNetworkStore(s => s.cables);
    const getLinkStatus = (portName: string) => {
        return cables.some(c =>
            (c.sourceDeviceId === device.id && c.sourcePortId?.includes(portName.split('/').pop() || '')) ||
            (c.targetDeviceId === device.id && c.targetPortId?.includes(portName.split('/').pop() || ''))
        );
    };

    return (
        <div className="relative w-full h-[60px] bg-[#1a1b1e] border-y border-[#2c2e33] flex items-center px-4 shadow-inner">
            {/* Rack Ears */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-[#25262b] border-r border-[#000] flex flex-col justify-center items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-[#111] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"></div>
                <div className="w-2 h-2 rounded-full bg-[#111] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"></div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-[#25262b] border-l border-[#000] flex flex-col justify-center items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-[#111] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"></div>
                <div className="w-2 h-2 rounded-full bg-[#111] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"></div>
            </div>

            {/* Device Info */}
            <div className="flex flex-col w-32 mr-8">
                <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest">{device.vendor}</span>
                <span className="text-white font-mono font-bold text-sm truncate">{device.hostname}</span>
                <div className="flex gap-1 mt-1">
                    <div className="w-2 h-1 bg-green-500 rounded-sm animate-pulse" title="PWR"></div>
                    <div className="w-2 h-1 bg-green-500 rounded-sm" title="SYS"></div>
                </div>
            </div>

            {/* Ports Grid */}
            <div className="flex-1 flex flex-wrap gap-x-1 gap-y-2 justify-start items-center h-full py-1">
                {ports.map((port, idx) => {
                    const isConnected = getLinkStatus(port.name);
                    const isConsole = port.type === 'console';

                    return (
                        <div key={idx} className="flex flex-col items-center group relative cursor-help">
                            {/* LED top */}
                            {!isConsole && (
                                <div className={`w-1.5 h-1 mb-0.5 rounded-sm ${isConnected ? 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.8)]' : 'bg-zinc-800'}`}></div>
                            )}

                            {/* Port Socket */}
                            <div className={`border border-zinc-700 bg-black rounded-[2px] flex items-start justify-center overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,1)]
                                  ${isConsole ? 'w-8 h-5 bg-zinc-900' : 'w-7 h-5'}
                              `}>
                                {/* Gold pins hint */}
                                {!isConsole && <div className="absolute top-0 w-4 h-1 bg-yellow-600/20 flex gap-[1px] justify-center pt-[1px]">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <div key={p} className="w-[1px] h-[2px] bg-yellow-600"></div>)}
                                </div>}

                                {/* Tab notch */}
                                {!isConsole && <div className="absolute bottom-0 w-2 h-1 bg-zinc-800 rounded-t-sm"></div>}
                            </div>

                            {/* Label */}
                            <span className="text-[6px] text-zinc-500 mt-0.5 font-mono opacity-0 group-hover:opacity-100 absolute -bottom-3 bg-black px-1 z-10 whitespace-nowrap">
                                {port.name}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Fan Status / Branding */}
            <div className="ml-auto w-16 h-full flex items-center justify-center opacity-20">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-500 border-dashed animate-[spin_4s_linear_infinite]"></div>
            </div>
        </div>
    );
};
