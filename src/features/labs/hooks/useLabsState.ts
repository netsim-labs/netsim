import { useState, useCallback, useMemo } from 'react';
import { useNetworkStore } from '../../../store/useNetworkStore';

// Local storage key for achievements
const ACHIEVEMENTS_KEY = 'netsim-achievements';

interface Achievement {
  id: string;
  unlockedAt: number;
}

export function useLabsState() {
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

  const [showLabsPanel, setShowLabsPanel] = useState(false);

  // Load achievements from localStorage
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>(() => {
    try {
      const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save achievement
  const unlockAchievement = useCallback((id: string) => {
    setUnlockedAchievements(prev => {
      if (prev.some(a => a.id === id)) return prev;
      const next = [...prev, { id, unlockedAt: Date.now() }];
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Calculate total stats
  const stats = useMemo(() => {
    const completedLabs = labHistory.filter(h => h.completedAt).length;
    const totalStars = labHistory.reduce((sum, h) => sum + (h.stars || 0), 0);
    const totalTime = labHistory.reduce((sum, h) => sum + (h.timeSpent || 0), 0);
    const perfectLabs = labHistory.filter(h => h.stars === 3).length;

    return {
      completedLabs,
      totalStars,
      totalTime,
      perfectLabs,
      totalLabs: availableLabs.length
    };
  }, [labHistory, availableLabs]);

  // Get lab by ID
  const getLabById = useCallback((id: string) => {
    return availableLabs.find(lab => lab.id === id);
  }, [availableLabs]);

  // Get progress for a specific lab
  const getLabProgress = useCallback((labId: string) => {
    return labHistory.find(h => h.labId === labId);
  }, [labHistory]);

  // Check if lab is completed
  const isLabCompleted = useCallback((labId: string) => {
    const progress = getLabProgress(labId);
    return !!progress?.completedAt;
  }, [getLabProgress]);

  // Handle starting a lab
  const handleStartLab = useCallback((labId: string) => {
    startLab(labId);
    setShowLabsPanel(false);
  }, [startLab]);

  // Handle completing current step
  const handleCompleteStep = useCallback(() => {
    if (!currentLabSession) return false;

    const lab = getLabById(currentLabSession.labId);
    if (!lab) return false;

    const currentStep = lab.steps[currentLabSession.progress.currentStep];
    const passed = validateCurrentStep();

    if (passed) {
      completeStep(currentStep.id);

      // Check if this was the last step
      if (currentLabSession.progress.currentStep >= lab.steps.length - 1) {
        finishLab();

        // Check for achievements
        const stars = getStarsForLab(lab.id);
        if (stars === 3) {
          unlockAchievement('perfect-score');
        }

        const completedCount = labHistory.filter(h => h.completedAt).length + 1;
        if (completedCount === 1) {
          unlockAchievement('first-lab');
        }
        if (completedCount >= 5) {
          unlockAchievement('dedicated');
        }
      }

      return true;
    }

    return false;
  }, [currentLabSession, getLabById, validateCurrentStep, completeStep, finishLab, getStarsForLab, labHistory, unlockAchievement]);

  return {
    // State
    availableLabs,
    currentLabSession,
    labHistory,
    showLabsPanel,
    unlockedAchievements,
    stats,

    // Actions
    setShowLabsPanel,
    loadLabs,
    handleStartLab,
    handleCompleteStep,
    resetLab,
    getLabById,
    getLabProgress,
    isLabCompleted,
    getStarsForLab,
    unlockAchievement
  };
}
