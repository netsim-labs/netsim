import { useNetworkStore } from '../../../store/useNetworkStore';
import { DeviceFaceplate } from './DeviceFaceplate';
import { Server } from 'lucide-react';

export const RackView = () => {
    // @ts-ignore
    const devices = useNetworkStore(s => s.devices);

    return (
        <div className="w-full h-full bg-[#121212] flex items-center justify-center p-8 overflow-y-auto">
            <div className="w-[800px] bg-[#000] border-x-[12px] border-[#222] shadow-2xl relative min-h-[600px] flex flex-col pt-4">
                {/* Rack Top Header */}
                <div className="absolute -top-6 left-0 right-0 h-6 bg-[#222] rounded-t-lg flex items-center justify-center border-b border-black">
                    <span className="text-[10px] text-zinc-500 font-mono tracking-widest">NETSIM RACK UNIT 01</span>
                </div>

                {/* Empty U markers background */}
                <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col" style={{ backgroundSize: '100% 40px' }}>
                    {Array.from({ length: 42 }).map((_, i) => (
                        <div key={i} className="h-[40px] border-b border-zinc-800 w-full flex items-center px-2">
                            <span className="text-zinc-600 text-xs font-mono">{42 - i}U</span>
                            <span className="ml-auto text-zinc-600 text-xs font-mono">{42 - i}U</span>
                        </div>
                    ))}
                </div>

                {/* Devices Stack */}
                <div className="z-10 flex flex-col gap-0.5 px-1 py-4">
                    {devices.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-[400px] text-zinc-600">
                            <Server size={48} className="mb-4 opacity-50" />
                            <p>Rack is empty. Add devices to the topology first.</p>
                        </div>
                    )}

                    {devices.map((device: any) => (
                        <div key={device.id} className="w-full">
                            <DeviceFaceplate device={device} />
                        </div>
                    ))}
                </div>

                {/* Floor Shadow */}
                <div className="absolute -bottom-12 left-4 right-4 h-12 bg-black/50 blur-xl rounded-[100%]"></div>
            </div>
        </div>
    );
};
