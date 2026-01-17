import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Monitor,
  Terminal,
  Beaker,
  Network,
  Bot,
  Settings,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { Button } from './shadcn-ui/button';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  icon: React.ReactNode;
  color: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to NetSim.dev!',
    description:
      'The next-generation network simulator with VRP-style CLI. We will guide you through key features to get you started designing today.',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'text-amber-500',
  },
  {
    id: 'sidebar',
    title: 'Device Catalog',
    description:
      'On the left sidebar you have everything you need: routers, switches, endpoints, and ready-to-use labs.',
    target: 'aside',
    icon: <Monitor className="w-8 h-8" />,
    color: 'text-blue-500',
  },
  {
    id: 'canvas',
    title: 'Interactive Canvas',
    description:
      'Drag and drop devices. Create connections by dragging from ports. Double-click to configure.',
    target: 'main',
    icon: <Network className="w-8 h-8" />,
    color: 'text-emerald-500',
  },
  {
    id: 'console',
    title: 'Realistic CLI Console',
    description:
      'Powerful command-line interfaces with intelligent autocomplete and full history management.',
    icon: <Terminal className="w-8 h-8" />,
    color: 'text-purple-500',
  },
  {
    id: 'labs',
    title: 'Guided Labs',
    description:
      'Challenge yourself with real scenarios. Complete objectives to earn badges and improve your networking skills.',
    icon: <Beaker className="w-8 h-8" />,
    color: 'text-pink-500',
  },
  {
    id: 'ai-copilot',
    title: 'AI Copilot',
    description:
      'A network expert by your side. Detects errors in your topology and answers theoretical questions instantly.',
    target: '[aria-label="Toggle AI Chat"]',
    icon: <Bot className="w-8 h-8" />,
    color: 'text-cyan-500',
  },
  {
    id: 'settings',
    title: 'Customization & API',
    description:
      'Integrate your own OpenAI or Anthropic keys in settings to unlock the most advanced AI models.',
    target: '[href="/settings"]',
    icon: <Settings className="w-8 h-8" />,
    color: 'text-slate-400',
  },
  {
    id: 'ready',
    title: 'All Set',
    description: 'Ctrl+K for quick actions, Ctrl+? for help. The network is yours!',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'text-amber-500',
  },
];

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * Premium Onboarding Tour - Pure Tailwind implementation.
 */
export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [open, setOpen] = useState(true);

  const totalSteps = onboardingSteps.length;
  const currentStepData = onboardingSteps[activeStep];
  const progress = ((activeStep + 1) / totalSteps) * 100;

  const handleNext = useCallback(() => {
    if (activeStep === totalSteps - 1) {
      setOpen(false);
      setTimeout(onComplete, 300);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  }, [activeStep, totalSteps, onComplete]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  }, []);

  const handleClose = () => {
    setOpen(false);
    setTimeout(onSkip, 300);
  };

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
      if (e.key === 'ArrowLeft') handleBack();
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNext, handleBack]);

  // Highlight effect
  useEffect(() => {
    if (currentStepData.target) {
      const element = document.querySelector(currentStepData.target);
      if (element) {
        element.classList.add('onboarding-highlight');
        return () => element.classList.remove('onboarding-highlight');
      }
    }
  }, [currentStepData.target]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-up"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-sm',
          'bg-gradient-to-br from-[rgba(10,10,12,0.95)] to-[rgba(5,5,8,0.98)]',
          'backdrop-blur-xl border border-white/10',
          'rounded-3xl shadow-[0_32px_100px_rgba(0,0,0,0.8)]',
          'overflow-hidden',
          'animate-fade-in-scale'
        )}
      >
        {/* Progress Bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-accent-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div
            className={cn(
              'w-20 h-20 mx-auto mb-6',
              'flex items-center justify-center',
              'bg-white/[0.03] border border-white/5 rounded-2xl',
              'shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
            )}
          >
            <span className={currentStepData.color}>{currentStepData.icon}</span>
          </div>

          {/* Step Counter */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
            Step {activeStep + 1} of {totalSteps}
          </p>

          {/* Title */}
          <h2 className="text-xl font-black text-white mb-3">
            {currentStepData.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-zinc-400 leading-relaxed px-4">
            {currentStepData.description}
          </p>

          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5 my-6">
            {onboardingSteps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-200',
                  i === activeStep
                    ? 'bg-accent-500 w-4'
                    : 'bg-white/10 hover:bg-white/20'
                )}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={activeStep === 0 ? handleClose : handleBack}
            >
              {activeStep > 0 && <ChevronLeft className="w-4 h-4 mr-2" />}
              {activeStep === 0 ? 'Skip' : 'Previous'}
            </Button>
            <Button
              onClick={handleNext}
            >
              {activeStep === totalSteps - 1 ? 'Start!' : 'Next'}
              {activeStep < totalSteps - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Hook to manage Onboarding state and persistence.
 */
const ONBOARDING_KEY = 'netsim-onboarding-completed-v2';

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  }, []);

  const skipOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'skipped');
    setShowOnboarding(false);
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowOnboarding(true);
  }, []);

  return {
    showOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}
