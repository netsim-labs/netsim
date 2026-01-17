/**
 * LabsPanel - Main panel for gamified labs
 * Shows available labs, progress, star scoring and automatic validation
 */

import React, { useEffect, useState } from 'react';
import { useNetworkStore } from '../store/useNetworkStore';
import { Lab } from '../types/NetworkTypes';
import { Star, Trophy, Clock, CheckCircle, XCircle, Play, Lightbulb, GraduationCap, X } from 'lucide-react';

interface LabsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LabsPanel: React.FC<LabsPanelProps> = ({ isOpen, onClose }) => {
  const {
    availableLabs,
    currentLabSession,
    labHistory,
    loadLabs,
    startLab,
    completeStep,
    validateCurrentStep,
    finishLab,
    resetLab,
    getStarsForLab
  } = useNetworkStore();

  const [showHints, setShowHints] = useState(false);

  const selectedLab = currentLabSession
    ? availableLabs.find(l => l.id === currentLabSession.labId) || null
    : null;

  useEffect(() => {
    if (isOpen && availableLabs.length === 0) {
      loadLabs();
    }
  }, [isOpen, availableLabs.length, loadLabs]);

  if (!isOpen && !currentLabSession) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'basic': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const renderStars = (stars: number, maxStars: number = 3) => {
    return Array.from({ length: maxStars }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
      />
    ));
  };

  const LabCard: React.FC<{ lab: Lab }> = ({ lab }) => {
    const progress = labHistory.find(p => p.labId === lab.id);
    const stars = getStarsForLab(lab.id);
    const isCompleted = progress?.completedAt;

    return (
      <div className="bg-card-bg border border-border-color rounded-premium overflow-hidden hover:border-blue-500/50 transition-all duration-300 group flex flex-col h-full shadow-lg">
        <div className="p-6 flex-1">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <GraduationCap size={24} />
            </div>
            <div className="flex items-center space-x-1 bg-black/20 px-2 py-1 rounded-full border border-border-color">
              {renderStars(stars)}
              {isCompleted && <Trophy className="w-3 h-3 text-yellow-500 ml-1" />}
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{lab.title}</h3>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">{lab.description}</p>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getDifficultyColor(lab.difficulty)}`}>
              {lab.difficulty}
            </span>
            <span className="text-xs text-gray-500 flex items-center bg-black/20 px-2 py-0.5 rounded-md border border-border-color">
              <Clock className="w-3 h-3 mr-1" />
              {lab.estimatedTime} min
            </span>
            <span className="text-xs text-gray-500 bg-black/20 px-2 py-0.5 rounded-md border border-border-color">
              {lab.certification.toUpperCase()}
            </span>
          </div>

          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Objectives:</h4>
            <ul className="space-y-1">
              {lab.objectives.slice(0, 2).map((objective, index) => (
                <li key={index} className="flex items-start text-xs text-gray-400">
                  <CheckCircle className="w-3 h-3 text-green-500/70 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 bg-black/20 border-t border-border-color">
          {progress && (
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round((progress.score / progress.maxScore) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${(progress.score / progress.maxScore) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              startLab(lab.id);
            }}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm font-medium shadow-lg shadow-blue-900/20"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            {isCompleted ? 'Repeat Lab' : progress ? 'Continue' : 'Start Lab'}
          </button>
        </div>
      </div>
    );
  };

  const LabSessionView: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
    if (!currentLabSession || !selectedLab) return null;

    const currentStep = selectedLab.steps[currentLabSession.progress.currentStep];
    const isStepCompleted = currentLabSession.progress.completedSteps.includes(currentStep.id);
    const validationResults = currentLabSession.validationResults.find(r => r.stepId === currentStep.id);

    // Common Step Content
    const StepContent = () => (
      <>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Lab Progress</span>
            <span>{currentLabSession.progress.completedSteps.length}/{selectedLab.steps.length}</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentLabSession.progress.completedSteps.length / selectedLab.steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-panel-bg border border-border-color rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-bold text-white text-sm">{currentStep.title}</h4>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">{currentStep.description}</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase">Points</div>
              <div className="text-sm font-bold text-blue-400">{currentStep.points}</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-3">
            <h5 className="font-semibold text-gray-300 text-xs mb-2">Instructions:</h5>
            <ol className="list-decimal list-inside space-y-1 text-gray-400 text-xs">
              {currentStep.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>

          {/* Commands */}
          {currentStep.commands.huawei && (
            <div className="mb-3">
              <h5 className="font-semibold text-gray-300 text-xs mb-2">Commands:</h5>
              <div className="bg-[#0c0c0c] border border-gray-800 text-green-400 p-2 rounded text-[10px] font-mono overflow-x-auto max-h-32 scrollbar-thin scrollbar-thumb-gray-700">
                {currentStep.commands.huawei.map((cmd, index) => (
                  <div key={index}>{cmd}</div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Results */}
          {validationResults && (
            <div className="mb-3 p-2 bg-black/20 rounded border border-gray-800">
              <h5 className="font-semibold text-gray-400 text-xs mb-1">Results:</h5>
              <div className="space-y-1">
                {validationResults.validations.map((validation, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {validation.passed ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs ${validation.passed ? 'text-green-500' : 'text-red-400'}`}>
                      {validation.errorMessage || 'Correct'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hints */}
          {currentStep.hints && (
            <div className="mb-3">
              <button
                onClick={() => setShowHints(!showHints)}
                className="flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                {showHints ? 'Hide hints' : 'I need a hint'}
              </button>
              {showHints && (
                <div className="mt-2 p-2 bg-yellow-900/10 border border-yellow-700/30 rounded">
                  <ul className="text-xs text-yellow-500 space-y-1">
                    {currentStep.hints.map((hint, index) => (
                      <li key={index}>• {hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => {
              const passed = validateCurrentStep();
              if (passed) {
                completeStep(currentStep.id);
                if (currentLabSession.progress.currentStep >= selectedLab.steps.length - 1) {
                  finishLab();
                }
              }
            }}
            disabled={isStepCompleted}
            className={`w-full py-2 rounded-lg font-bold text-xs transition-all ${isStepCompleted
              ? 'bg-green-600/20 text-green-400 border border-green-600/50 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 active:scale-95'
              }`}
          >
            {isStepCompleted ? '✓ Completed' : 'Validate Step'}
          </button>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-between items-center px-1">
          <button
            onClick={() => {
              // Logic needs to be implemented in store or here to move back/forward without validating
              // For now, these are just placeholders or need implementation if store supports it
              // Assuming we can't easily go back/forth without completing in the current model
              // But UI requires navigation buttons
            }}
            disabled={currentLabSession.progress.currentStep === 0}
            className="text-xs text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
          >
            ← Previous
          </button>

          <div className="flex space-x-1">
            {selectedLab.steps.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${index < currentLabSession.progress.currentStep
                  ? 'bg-green-500'
                  : index === currentLabSession.progress.currentStep
                    ? 'bg-blue-500'
                    : 'bg-gray-700'
                  }`}
              />
            ))}
          </div>

          <button
            disabled={currentLabSession.progress.currentStep >= selectedLab.steps.length - 1}
            className="text-xs text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
          >
            Next →
          </button>
        </div>
      </>
    );

    if (compact) {
      // Overlay Mode (Compact)
      return (
        <div className="space-y-0">
          <StepContent />
        </div>
      );
    }

    // Full Mode (Not really used if we use overlay always for active labs, but keeping for completeness)
    return (
      <div className="max-w-4xl mx-auto text-white">
        <h2 className="text-2xl font-bold mb-4">{selectedLab.title}</h2>
        <StepContent />
      </div>
    );
  };

  // If active session, show overlay
  if (currentLabSession) {
    return (
      <div className="fixed top-24 right-6 z-40 w-96 max-h-[calc(100vh-8rem)] flex flex-col bg-network-bg/90 backdrop-blur-md border border-border-color rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-border-color bg-gradient-to-r from-blue-900/50 to-purple-900/50">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🧪</span>
            <div>
              <h3 className="font-bold text-white text-xs truncate max-w-[200px]">{selectedLab?.title}</h3>
              <p className="text-[10px] text-gray-400">Step {currentLabSession.progress.currentStep + 1} / {selectedLab?.steps.length}</p>
            </div>
          </div>
          <button
            onClick={resetLab}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded p-1 transition-colors"
            title="Exit lab"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <LabSessionView compact={true} />
        </div>
      </div>
    );
  }

  // Labs List View (Overlay/Modal)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl h-[85vh] bg-network-bg border border-border-color rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        {/* Header */}
        <div className="p-8 pb-4 border-b border-border-color/50 flex justify-between items-start bg-network-bg z-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="text-4xl">🧪</span>
              Labs
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Improve your skills with practical scenarios and real-time validation.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent bg-[#080a11]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableLabs.map(lab => (
              <LabCard key={lab.id} lab={lab} />
            ))}
          </div>

          {availableLabs.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-block p-6 rounded-full bg-panel-bg border border-border-color mb-4">
                <GraduationCap size={48} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Loading Labs...</h3>
              <p className="text-gray-500">Preparing the learning environment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
