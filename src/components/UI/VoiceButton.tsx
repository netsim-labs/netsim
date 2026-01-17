import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { cn } from '../../utils/cn';
import { Tooltip } from './Tooltip';

interface VoiceButtonProps {
    onTranscriptProgress?: (text: string) => void;
    onTranscriptComplete?: (text: string) => void;
    className?: string;
    size?: number;
}

/**
 * VoiceButton Component
 * provides a UI for the useVoiceRecognition hook with premium animations.
 */
export const VoiceButton: React.FC<VoiceButtonProps> = ({
    onTranscriptProgress,
    onTranscriptComplete,
    className,
    size = 18
}) => {
    const { isListening, transcript, error, startListening, stopListening } = useVoiceRecognition();
    const [hasPermissionError, setHasPermissionError] = useState(false);

    // Sync transcript progress
    useEffect(() => {
        if (isListening && transcript) {
            onTranscriptProgress?.(transcript);
        }
    }, [transcript, isListening, onTranscriptProgress]);

    // Handle end of speech
    useEffect(() => {
        if (!isListening && transcript) {
            onTranscriptComplete?.(transcript);
        }
    }, [isListening, transcript, onTranscriptComplete]);

    // Handle errors
    useEffect(() => {
        if (error === 'not-allowed') {
            setHasPermissionError(true);
        }
    }, [error]);

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <Tooltip content={isListening ? "Escuchando..." : (hasPermissionError ? "Error de Permiso Mic" : "Control por Voz")}>
            <button
                type="button"
                onClick={toggleListening}
                className={cn(
                    "relative p-2 rounded-xl transition-all duration-300",
                    isListening
                        ? "bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-110"
                        : "text-zinc-500 hover:text-white hover:bg-white/5",
                    hasPermissionError && "text-amber-500 bg-amber-500/10",
                    className
                )}
            >
                {/* Visual Pulse Animation when listening */}
                {isListening && (
                    <span className="absolute inset-0 rounded-xl bg-red-500/20 animate-ping opacity-75" />
                )}

                {isListening ? (
                    <MicOff size={size} className="relative z-10" />
                ) : (
                    <Mic size={size} className="relative z-10" />
                )}

                {/* Mini Loading Spinner if starting */}
                {!isListening && transcript === '' && error === null && !isListening && (
                    <div className="hidden">
                        <Loader2 className="animate-spin" />
                    </div>
                )}
            </button>
        </Tooltip>
    );
};
