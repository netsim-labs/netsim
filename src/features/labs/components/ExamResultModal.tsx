import React from 'react';
import { Trophy, XCircle } from 'lucide-react';
import { LabSession } from '../../../types/NetworkTypes';

interface ExamResultModalProps {
    session: LabSession;
    onClose: () => void;
    onRetry: () => void;
}

export const ExamResultModal: React.FC<ExamResultModalProps> = ({ session, onClose, onRetry }) => {
    if (!session.isExamMode) return null;

    const { score, maxScore, timeSpent, hintsUsed } = session.progress;
    const strikes = session.examStrikes || 0;
    const timeLimit = session.examTimeLimit || 0;

    // Pass criteria: > 70% score AND < time limit AND < 3 strikes
    const scorePercentage = (score / maxScore) * 100;
    const isTimeValid = timeLimit > 0 ? timeSpent <= timeLimit : true; // grace period handling logic elsewhere
    const isStrikesValid = strikes < 3;
    const isPassed = scorePercentage >= 70 && isTimeValid && isStrikesValid;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in text-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className={`absolute inset-0 opacity-20 pointer-events-none ${isPassed ? 'bg-gradient-to-br from-green-500/50 to-emerald-500/50' : 'bg-gradient-to-br from-red-500/50 to-orange-500/50'}`} />

                <div className="relative z-10">
                    <div className={`inline-flex p-4 rounded-full mb-6 ${isPassed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {isPassed ? <Trophy size={48} /> : <XCircle size={48} />}
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2">
                        {isPassed ? 'Exam Passed!' : 'Exam Failed'}
                    </h2>

                    {!isPassed && (
                        <div className="flex flex-col gap-1 mb-6">
                            {!isStrikesValid && <div className="text-red-400 text-sm font-bold flex items-center justify-center gap-2">⚠️ Excessive Strikes (AI Usage / Help)</div>}
                            {!isTimeValid && <div className="text-red-400 text-sm font-bold flex items-center justify-center gap-2">⏰ Time Expired</div>}
                            {scorePercentage < 70 && <div className="text-red-400 text-sm font-bold flex items-center justify-center gap-2">📉 Insufficient Score (&lt; 70%)</div>}
                        </div>
                    )}

                    <p className="text-zinc-400 mb-8">
                        {isPassed
                            ? 'You have demonstrated your skills under pressure. Excellent work!'
                            : 'Don\'t give up. Review the concepts and try again.'}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Score</div>
                            <div className={`text-2xl font-bold ${scorePercentage >= 70 ? 'text-green-400' : 'text-red-400'}`}>
                                {Math.round(scorePercentage)}%
                            </div>
                            <div className="text-xs text-zinc-600">{score}/{maxScore} pts</div>
                        </div>

                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Time</div>
                            <div className={`text-2xl font-bold ${isTimeValid ? 'text-white' : 'text-red-400'}`}>
                                {formatTime(timeSpent)}
                            </div>
                            <div className="text-xs text-zinc-600">Limit: {formatTime(timeLimit)}</div>
                        </div>

                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Strikes</div>
                            <div className={`text-2xl font-bold ${strikes === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {strikes}
                            </div>
                            <div className="text-xs text-zinc-600">Max: 3</div>
                        </div>

                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Hints</div>
                            <div className="text-2xl font-bold text-white">
                                {hintsUsed > 0 ? '🚫' : '0'}
                            </div>
                            <div className="text-xs text-zinc-600">Not allowed</div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-lg border border-zinc-700 text-zinc-300 font-bold hover:bg-zinc-800 transition-colors"
                        >
                            Back to Menu
                        </button>
                        <button
                            onClick={onRetry}
                            className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 hover:scale-105 transition-all shadow-lg shadow-blue-900/20"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
