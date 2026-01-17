/**
 * Gamified Labs Slice
 * Interactive labs system with scoring, automatic validation, and stars
 */

import { StateCreator } from 'zustand';
import {
  Lab,
  LabProgress,
  LabSession,
  LabStep,
  LabValidation,
  LabValidationContext
} from '../../types/NetworkTypes';
import { ALL_LABS } from '../../data/labs/index.js';
import { buildLabTopology } from '../../utils/labTopologyBuilder';

export interface LabsSlice {
  // State
  availableLabs: Lab[];
  currentLabSession: LabSession | null;
  labHistory: LabProgress[];
  externalIntegration: {
    apiKey?: string;
    apiSecret?: string;
    externalUserId?: string;
    isExternal: boolean;
  } | null;

  // Actions
  loadLabs: () => void;
  addLab: (lab: Lab) => void;

  startLab: (labId: string, isExamMode?: boolean) => void;
  completeStep: (stepId: string) => void;
  goToLabStep: (stepIndex: number) => void;
  validateCurrentStep: () => boolean;
  finishLab: () => void;
  forceEndExam: () => void;
  resetLab: () => void;
  getLabProgress: (labId: string) => LabProgress | undefined;
  getStarsForLab: (labId: string) => number;
  setExternalIntegration: (integration: LabsSlice['externalIntegration']) => void;
  addExamStrike: () => void;
}

type LabValidationResult = LabSession['validationResults'][number];



export const createLabsSlice: StateCreator<any, [], [], LabsSlice> = (set, get) => ({
  availableLabs: [],
  currentLabSession: null,
  labHistory: [],
  externalIntegration: null,

  loadLabs: () => {
    set({ availableLabs: ALL_LABS });
  },

  addLab: (lab: Lab) => {
    set((state: any) => ({
      availableLabs: [lab, ...state.availableLabs]
    }));
  },

  startLab: (labId: string, isExamMode: boolean = false) => {
    const { availableLabs } = get();
    const lab = availableLabs.find((l: Lab) => l.id === labId);

    if (!lab) return;

    const examTimeLimit = isExamMode ? (lab.estimatedTime * 60) : undefined;
    const topology = buildLabTopology(lab);
    const session: LabSession = {
      labId,
      isExamMode,
      examStartTime: isExamMode ? Date.now() : undefined,
      examTimeLimit,
      examStrikes: isExamMode ? 0 : undefined,
      progress: {
        labId,
        userId: 'guest-user',
        startedAt: new Date().toISOString(),
        currentStep: 0,
        completedSteps: [],
        score: 0,
        maxScore: lab.steps.reduce((sum: number, step: LabStep) => sum + step.points, 0),
        stars: 0,
        attempts: 1,
        timeSpent: 0,
        hintsUsed: 0,
        validationsPassed: [],
        validationsFailed: []
      },
      topologySnapshot: {
        devices: JSON.parse(JSON.stringify(topology.devices)),
        cables: JSON.parse(JSON.stringify(topology.cables))
      },
      commandHistory: [],
      validationResults: lab.steps.map((step: LabStep) => ({
        stepId: step.id,
        validations: step.validation.map(v => ({
          id: `${step.id}-${v.type}`,
          passed: false,
          errorMessage: undefined
        }))
      }))
    };

    // Apply topology to the store
    (get() as any).setTopology(topology.devices, topology.cables);
    set({ currentLabSession: session });
  },


  completeStep: (stepId: string) => {
    const { currentLabSession } = get();
    if (!currentLabSession) return;

    const step = currentLabSession.progress.completedSteps.includes(stepId)
      ? currentLabSession.progress.completedSteps
      : [...currentLabSession.progress.completedSteps, stepId];

    const lab = get().availableLabs.find((l: Lab) => l.id === currentLabSession.labId);
    const stepData = lab?.steps.find((s: LabStep) => s.id === stepId);

    const newScore = currentLabSession.progress.score + (stepData?.points || 0);

    set({
      currentLabSession: {
        ...currentLabSession,
        progress: {
          ...currentLabSession.progress,
          completedSteps: step,
          score: newScore,
          currentStep: Math.min(currentLabSession.progress.currentStep + 1, (lab?.steps.length || 0) - 1)
        }
      }
    });
  },

  goToLabStep: (stepIndex: number) => {
    const { currentLabSession } = get();
    if (!currentLabSession) return;

    const lab = get().availableLabs.find((l: Lab) => l.id === currentLabSession.labId);
    if (!lab) return;

    // Validate step index
    if (stepIndex < 0 || stepIndex >= lab.steps.length) return;

    // Update current step
    set({
      currentLabSession: {
        ...currentLabSession,
        progress: {
          ...currentLabSession.progress,
          currentStep: stepIndex
        }
      }
    });
  },

  validateCurrentStep: () => {
    const { currentLabSession, devices, cables } = get();
    if (!currentLabSession) return false;

    const lab = get().availableLabs.find((l: Lab) => l.id === currentLabSession.labId);
    if (!lab) return false;

    const currentStepIndex = currentLabSession.progress.currentStep;
    const step = lab.steps[currentStepIndex];
    if (!step) return false;

    const context: LabValidationContext = {
      devices,
      cables,
      commands: currentLabSession.commandHistory,
      topology: { devices, cables }
    };

    let allPassed = true;
    const validationResults = step.validation.map((validation: LabValidation) => {
      const passed = validation.check(context);
      if (!passed) allPassed = false;
      return {
        id: `${step.id}-${validation.type}`,
        passed,
        errorMessage: passed ? undefined : validation.errorMessage
      };
    });

    // Update validation results
    const updatedResults = currentLabSession.validationResults.map((result: LabValidationResult) =>
      result.stepId === step.id ? { ...result, validations: validationResults } : result
    );

    set({
      currentLabSession: {
        ...currentLabSession,
        validationResults: updatedResults
      }
    });

    return allPassed;
  },

  finishLab: () => {
    const { currentLabSession, externalIntegration } = get();
    if (!currentLabSession) return;

    const lab = get().availableLabs.find((l: Lab) => l.id === currentLabSession.labId);
    if (!lab) return;

    // Calculate stars based on score and hints used
    const scorePercentage = currentLabSession.progress.score / currentLabSession.progress.maxScore;
    let stars = 0;
    if (scorePercentage >= 0.8 && currentLabSession.progress.hintsUsed <= 2) stars = 3;
    else if (scorePercentage >= 0.6 && currentLabSession.progress.hintsUsed <= 4) stars = 2;
    else if (scorePercentage >= 0.4) stars = 1;

    const completedProgress: LabProgress = {
      ...currentLabSession.progress,
      completedAt: new Date().toISOString(),
      stars
    };

    // --- GAMIFICATION: Award XP for Lab Completion ---
    // Base XP: 50. Bonus Stars: 1 star=10xp, 2=25xp, 3=50xp
    // Exam Bonus: 2x XP if passed!
    const isExam = currentLabSession.isExamMode;
    const examPassed = isExam && scorePercentage >= 0.7 && (currentLabSession.examStrikes || 0) < 3;

    const starBonus = stars === 3 ? 50 : stars === 2 ? 25 : stars === 1 ? 10 : 0;
    let totalXpAward = 50 + starBonus;

    if (isExam && examPassed) totalXpAward *= 2;

    // (get() as any).addXp(totalXpAward, isExam ? `Exam Passed: ${lab.title}` : `Lab Completion: ${lab.title}`);

    // Lab completion handled locally for Community Edition

    set({
      currentLabSession: isExam ? { ...currentLabSession, progress: completedProgress } : null,
      labHistory: [...get().labHistory, completedProgress]
    });
  },

  forceEndExam: () => {
    const { currentLabSession } = get();
    if (!currentLabSession || !currentLabSession.isExamMode) return;

    // Set timeSpent to limit or slightly more to indicate timeout
    const finalizedSession = {
      ...currentLabSession,
      progress: {
        ...currentLabSession.progress,
        completedAt: new Date().toISOString(),
        timeSpent: currentLabSession.examTimeLimit || 0
      }
    };

    set({
      currentLabSession: finalizedSession,
      labHistory: [...get().labHistory, finalizedSession.progress]
    });
  },

  resetLab: () => {
    set({ currentLabSession: null });
  },

  getLabProgress: (labId: string) => {
    return get().labHistory.find((p: LabProgress) => p.labId === labId);
  },

  getStarsForLab: (labId: string) => {
    const progress = get().getLabProgress(labId);
    return progress?.stars || 0;
  },

  setExternalIntegration: (integration: LabsSlice['externalIntegration']) => {
    set({ externalIntegration: integration });
  },

  addExamStrike: () => {
    const { currentLabSession, finishLab } = get();
    if (!currentLabSession || !currentLabSession.isExamMode) return;

    const newStrikes = (currentLabSession.examStrikes || 0) + 1;

    // Increment strikes
    set({
      currentLabSession: {
        ...currentLabSession,
        examStrikes: newStrikes
      }
    });

    // Automatic failure on 3 strikes
    if (newStrikes >= 3) {
      finishLab();
    }
  }
});
