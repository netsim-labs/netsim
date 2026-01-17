/**
 * LabsPanelEnhanced - Enhanced panel for gamified laboratories
 * With functional navigation, achievements and better UX
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNetworkStore } from '../../../store/useNetworkStore';
import { Lab } from '../../../types/NetworkTypes';
import {
  Star,
  Trophy,
  Clock,
  CheckCircle,
  Play,
  Lightbulb,
  GraduationCap,
  X,
  ChevronLeft,
  ChevronRight,
  Award,
  Target,
  Zap,
  ArrowRight
} from 'lucide-react';
import { LabsGridSkeleton } from '../../../components/UI/Skeleton';
import { ExamResultModal } from './ExamResultModal';

import {
  Timer,
  AlertTriangle,
  MinusIcon,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LabsPanelEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
}

// Achievement definitions
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  condition: (labHistory: any[]) => boolean;
  reward?: string;
}

const achievements: Achievement[] = [
  {
    id: 'first-lab',
    title: 'First Step',
    description: 'Complete your first laboratory',
    icon: <Star className="text-yellow-400" size={20} />,
    condition: (history) => history.some(h => h.completedAt)
  },
  {
    id: 'perfect-score',
    title: 'Perfectionist',
    description: 'Get 3 stars in a laboratory',
    icon: <Trophy className="text-amber-400" size={20} />,
    condition: (history) => history.some(h => h.stars === 3)
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Complete a lab in less than 5 minutes',
    icon: <Zap className="text-purple-400" size={20} />,
    condition: (history) => history.some(h => h.completedAt && h.timeSpent && h.timeSpent < 300000)
  },
  {
    id: 'dedicated',
    title: 'Dedication',
    description: 'Complete 5 laboratories',
    icon: <Target className="text-blue-400" size={20} />,
    condition: (history) => history.filter(h => h.completedAt).length >= 5
  },
  {
    id: 'master',
    title: 'Master',
    description: 'Complete all laboratories with 3 stars',
    icon: <Award className="text-emerald-400" size={20} />,
    condition: (history) => {
      const completed = history.filter(h => h.stars === 3);
      return completed.length >= 10; // Assuming 10 labs
    }
  }
];

// Helper functions
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'basic': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'intermediate': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'advanced': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    case 'expert': return 'bg-red-500/10 text-red-400 border border-red-500/20';
    default: return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
  }
};

const renderStars = (count: number) => {
  return Array.from({ length: 3 }).map((_, i) => (
    <Star
      key={i}
      size={12}
      className={i < count ? 'text-yellow-500 fill-current' : 'text-zinc-700'}
      aria-hidden="true"
    />
  ));
};

const UsersExamBadge = ({ isExamMode }: { isExamMode: boolean }) => (
  <span className={`text-[10px] font-bold uppercase tracking-wider ${isExamMode ? 'text-red-400' : 'text-zinc-500'}`}>
    Exam Mode {isExamMode && '🔥'}
  </span>
);

const AchievementsPanel = ({ unlockedAchievements, totalStars }: { unlockedAchievements: any[], totalStars: number }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Your Achievements</h2>
        <p className="text-zinc-500 text-sm">You have earned a total of {totalStars} stars</p>
      </div>
      <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
        <Star className="text-yellow-500 fill-current" size={20} />
        <span className="text-xl font-bold text-white">{totalStars}</span>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {achievements.map((achievement) => {
        const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id);
        return (
          <div
            key={achievement.id}
            className={`p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${isUnlocked
              ? 'bg-zinc-800/50 border-zinc-700 shadow-lg'
              : 'bg-zinc-900/20 border-zinc-800/50 opacity-50 grayscale'
              }`}
          >
            <div className={`p-3 rounded-xl ${isUnlocked ? 'bg-zinc-800' : 'bg-transparent'}`}>
              {achievement.icon}
            </div>
            <div>
              <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>{achievement.title}</h3>
              <p className="text-xs text-zinc-500">{achievement.description}</p>
            </div>
            {isUnlocked && <CheckCircle className="ml-auto text-emerald-500" size={16} />}
          </div>
        );
      })}
    </div>
  </div>
);

const LabSessionView = ({
  currentLabSession,
  selectedLab,
  forceEndExam,
  setShowExamResult,
  handlePreviousStep,
  handleNextStep,
  handleGoToStep,
  showHints,
  setShowHints
}: any) => {
  const isExam = currentLabSession.isExamMode;

  useEffect(() => {
    if (isExam && currentLabSession.examStartTime) {
      const timeLimit = currentLabSession.examTimeLimit || 1800000; // 30m default
      const elapsed = Date.now() - currentLabSession.examStartTime;
      const remaining = timeLimit - elapsed;

      if (remaining <= 0) {
        forceEndExam();
        setShowExamResult(true);
      }
    }
  }, [isExam, currentLabSession.examStartTime, currentLabSession.examTimeLimit, forceEndExam, setShowExamResult]);

  const currentStep = selectedLab.steps[currentLabSession.progress.currentStep];

  return (
    <div className="space-y-6">
      {isExam && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-400">
            <Timer size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Exam Mode Active</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-red-500" />
              <span className="text-[10px] font-bold text-red-500">STRIKES: {currentLabSession.strikes || 0}/3</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold border border-blue-500/30">
            {currentLabSession.progress.currentStep + 1}
          </div>
          <h4 className="text-sm font-bold text-white mb-0">{currentStep.title}</h4>
        </div>

        <div className="text-xs text-zinc-400 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5 italic">
          &quot;{currentStep.description}&quot;
        </div>

        <div className="space-y-3">
          <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Instructions:</h5>
          <ul className="space-y-2">
            {currentStep.instructions.map((instruction: string, i: number) => (
              <li key={i} className="flex items-start text-xs text-zinc-300 bg-zinc-900/50 p-3 rounded-lg border border-white/[0.03] group hover:border-blue-500/30 transition-colors">
                <ArrowRight size={12} className="mr-2 mt-0.5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                {instruction}
              </li>
            ))}
          </ul>
        </div>

        {!isExam && (
          <div className="pt-4 border-t border-white/5">
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-2 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
            >
              <Lightbulb size={12} />
              {showHints ? 'Hide Hints' : 'View Hints'}
            </button>
            {showHints && (
              <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-xs text-blue-300/80 animate-in fade-in slide-in-from-top-2 duration-300">
                {currentStep.hints?.length > 0 ? currentStep.hints[0] : "No hints available for this step."}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <button
          onClick={handlePreviousStep}
          disabled={currentLabSession.progress.currentStep === 0}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous step"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex gap-1">
          {selectedLab.steps.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => handleGoToStep(i)}
              disabled={i > currentLabSession.progress.currentStep}
              className={`w-2 h-2 rounded-full transition-all ${i === currentLabSession.progress.currentStep
                ? 'bg-blue-500 w-4'
                : i < currentLabSession.progress.currentStep
                  ? 'bg-emerald-500'
                  : 'bg-zinc-700'
                }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNextStep}
          disabled={currentLabSession.progress.currentStep === selectedLab.steps.length - 1}
          className="p-2 rounded-lg bg-blue-600 border border-blue-500 text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20"
          aria-label="Next step"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export const LabsPanelEnhanced: React.FC<LabsPanelEnhancedProps> = ({ isOpen, onClose }) => {
  const {
    availableLabs,
    currentLabSession,
    labHistory,
    loadLabs,
    startLab,
    goToLabStep,
    forceEndExam,
    resetLab,
    getStarsForLab
  } = useNetworkStore();

  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const [showExamResult, setShowExamResult] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (isOpen && availableLabs.length === 0) {
      setIsLoading(true);
      loadLabs();
      // Simulate loading for better UX
      setTimeout(() => setIsLoading(false), 500);
    } else {
      setIsLoading(false);
    }
  }, [isOpen, availableLabs.length, loadLabs]);

  // Update selected lab when starting
  useEffect(() => {
    if (currentLabSession) {
      const lab = availableLabs.find(l => l.id === currentLabSession.labId);
      if (lab) setSelectedLab(lab);
    }
  }, [currentLabSession, availableLabs]);

  // Get unlocked achievements
  const unlockedAchievements = achievements.filter(a => a.condition(labHistory));
  const totalStars = labHistory.reduce((sum, h) => sum + (h.stars || 0), 0);

  // Navigate to step
  const handleGoToStep = useCallback((stepIndex: number) => {
    if (!currentLabSession || !selectedLab) return;

    // Only allow going to completed steps or current step
    if (stepIndex <= currentLabSession.progress.currentStep) {
      goToLabStep(stepIndex);
    }
  }, [currentLabSession, selectedLab, goToLabStep]);

  // Handle next step
  const handleNextStep = useCallback(() => {
    if (!currentLabSession || !selectedLab) return;
    const currentIndex = currentLabSession.progress.currentStep;
    if (currentIndex < selectedLab.steps.length - 1) {
      handleGoToStep(currentIndex + 1);
    }
  }, [currentLabSession, selectedLab, handleGoToStep]);

  // Handle previous step
  const handlePreviousStep = useCallback(() => {
    if (!currentLabSession) return;
    const currentIndex = currentLabSession.progress.currentStep;
    if (currentIndex > 0) {
      handleGoToStep(currentIndex - 1);
    }
  }, [currentLabSession, handleGoToStep]);

  // LabCard with enhanced UI and semantic colors
  const LabCard: React.FC<{ lab: Lab }> = ({ lab }) => {
    const progress = labHistory.find(p => p.labId === lab.id);
    const stars = getStarsForLab(lab.id);
    const isCompleted = !!progress?.completedAt;
    const [localExamMode, setLocalExamMode] = useState(false);

    return (
      <div
        className="bg-card-bg border border-border-subtle rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 group flex flex-col h-full hover:-translate-y-1"
        role="article"
        aria-label={`Lab: ${lab.title}`}
      >
        <div className="p-6 flex-1">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors" aria-hidden="true">
              <GraduationCap size={24} />
            </div>
            <div className="flex items-center space-x-1 bg-black/20 px-2 py-1 rounded-full border border-border-subtle">
              {renderStars(stars)}
              {isCompleted && <Trophy className="w-3 h-3 text-yellow-500 ml-1" aria-label="Completed" />}
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
            {lab.title}
          </h3>
          <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{lab.description}</p>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getDifficultyColor(lab.difficulty)}`}>
              {lab.difficulty}
            </span>
            <span className="text-xs text-zinc-500 flex items-center bg-black/20 px-2 py-0.5 rounded-md border border-border-subtle">
              <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
              {lab.estimatedTime} min
            </span>
            <span className="text-xs text-zinc-500 bg-black/20 px-2 py-0.5 rounded-md border border-border-subtle">
              {lab.certification.toUpperCase()}
            </span>
          </div>

          <div className="mb-4">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Objectives:</h4>
            <ul className="space-y-1">
              {lab.objectives.slice(0, 2).map((objective, index) => (
                <li key={index} className="flex items-start text-xs text-zinc-400">
                  <CheckCircle className="w-3 h-3 text-green-500/70 mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span className="line-clamp-1">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 bg-black/20 border-t border-border-subtle">
          {progress && (
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Progress</span>
                <span>{Math.round((progress.score / progress.maxScore) * 100)}%</span>
              </div>
              <div className="w-full bg-zinc-700/50 rounded-full h-1.5 overflow-hidden" role="progressbar" aria-valuenow={Math.round((progress.score / progress.maxScore) * 100)} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(progress.score / progress.maxScore) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 mb-3">
            <label
              className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none group-hover:text-zinc-300"
              onClick={(e) => {
                e.preventDefault();
                setLocalExamMode(prev => !prev);
              }}
            >
              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${localExamMode ? 'bg-red-600' : 'bg-zinc-700'}`}>
                <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${localExamMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>

              <UsersExamBadge isExamMode={localExamMode} />
            </label>
          </div>

          <button
            onClick={() => {
              setSelectedLab(lab);
              startLab(lab.id, localExamMode);
              onClose(); // UX: Auto-close after starting
            }}
            className={`w-full py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm font-medium shadow-lg btn-ripple group-hover:shadow-lg ${localExamMode
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20 group-hover:shadow-red-500/40'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 group-hover:shadow-blue-500/40'
              }`}
          >
            <Play className="w-4 h-4 mr-2 fill-current" aria-hidden="true" />
            {localExamMode ? 'Start Exam' : (isCompleted ? 'Repeat Lab' : progress ? 'Continue' : 'Start Lab')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Labs list modal - Only renders if isOpen is true */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="labs-title"
        >
          <div
            className="w-full max-w-5xl h-[85vh] bg-network-bg border border-border-color rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-fade-in-scale"
            onClick={e => e.stopPropagation()}
          >
            {/* Ambient Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" aria-hidden="true" />

            {/* Header */}
            <div className="p-8 pb-4 border-b border-border-color/50 flex justify-between items-start bg-network-bg z-10">
              <div>
                <h1 id="labs-title" className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  <span className="text-4xl" aria-hidden="true">🧪</span>
                  Built-in Labs
                </h1>
                <p className="text-gray-400 mt-2 text-lg">
                  Enhance your skills with practical scenarios and real-time validation.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Close"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-surface-elevated">
              {showAchievements ? (
                <AchievementsPanel unlockedAchievements={unlockedAchievements} totalStars={totalStars} />
              ) : isLoading ? (
                <LabsGridSkeleton count={6} />
              ) : availableLabs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableLabs.map(lab => (
                    <LabCard key={lab.id} lab={lab} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="inline-block p-6 rounded-full bg-zinc-900 border border-zinc-800 mb-4">
                    <GraduationCap size={48} className="text-gray-600" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">No laboratories available</h3>
                  <p className="text-gray-500">Laboratories will load soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Lab HUD - Renders independently of selection modal */}
      {currentLabSession && selectedLab && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            height: isMinimized ? 'auto' : 'auto'
          }}
          className="fixed top-24 right-6 z-40 w-96 flex flex-col bg-network-bg/95 backdrop-blur-md border border-border-color rounded-xl shadow-2xl overflow-hidden shadow-netsim-cyan/5"
          role="region"
          aria-label={`Active Lab HUD: ${selectedLab?.title}`}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b border-border-color bg-gradient-to-r from-blue-900/40 to-purple-900/40 cursor-move">
            <div className="flex items-center space-x-2">
              <span className="text-lg" aria-hidden="true">🧪</span>
              <div>
                <h3 className="font-bold text-white text-xs truncate max-w-[150px]">{selectedLab.title}</h3>
                <p className="text-[10px] text-gray-400">
                  Step {currentLabSession.progress.currentStep + 1} / {selectedLab.steps.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded p-1 transition-colors"
                aria-label={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={14} /> : <MinusIcon size={14} />}
              </button>
              <button
                onClick={resetLab}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded p-1 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Exit lab"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-4 overflow-y-auto custom-scrollbar max-h-[60vh]"
              >
                <LabSessionView
                  currentLabSession={currentLabSession}
                  selectedLab={selectedLab}
                  forceEndExam={forceEndExam}
                  setShowExamResult={setShowExamResult}
                  handlePreviousStep={handlePreviousStep}
                  handleNextStep={handleNextStep}
                  handleGoToStep={handleGoToStep}
                  showHints={showHints}
                  setShowHints={setShowHints}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {showExamResult && currentLabSession && (
        <ExamResultModal
          session={currentLabSession}
          onClose={() => {
            setShowExamResult(false);
            resetLab();
          }}
          onRetry={() => {
            const labId = currentLabSession.labId;
            setShowExamResult(false);
            resetLab();
            setTimeout(() => startLab(labId, true), 100);
          }}
        />
      )}
    </>
  );
};
