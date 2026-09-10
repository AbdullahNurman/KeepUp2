import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Check } from 'lucide-react';
import { GuidedSession, BreathingPhase, SessionStep } from '@/types/session';
import { accentThemes } from '@/lib/accentTheme';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { BreathingAnimation } from '@/components/BreathingAnimation';

interface GuidedSessionPlayerProps {
  session: GuidedSession;
  onClose: () => void;
  onComplete: () => void;
}

type Phase = 'intro' | 'active' | 'outro' | 'done';

export function GuidedSessionPlayer({ session, onClose, onComplete }: GuidedSessionPlayerProps) {
  const theme = accentThemes[session.accent];
  const { speak, cancel, muted, toggleMuted } = useSpeechSynthesis();

  const [phase, setPhase] = useState<Phase>('intro');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const breathingPhases = session.kind === 'breathing' ? session.phases : null;
  const timelineSteps = session.kind === 'timeline' ? session.steps : null;

  const [breathPhaseIdx, setBreathPhaseIdx] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const introSpokenRef = useRef(false);

  const startIntro = useCallback(() => {
    setPhase('intro');
    setTimeLeft(12);
    if (!introSpokenRef.current) {
      introSpokenRef.current = true;
      speak(session.intro);
    }
  }, [session.intro, speak]);

  useEffect(() => {
    startIntro();
    return () => cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPhase('done');
    speak(session.outro);
    onComplete();
  }, [session.outro, speak, onComplete]);

  // Main timer loop
  useEffect(() => {
    if (isPaused || phase === 'done') return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Time's up for current segment — advance
        if (phase === 'intro') {
          if (session.kind === 'breathing' && breathingPhases) {
            setPhase('active');
            setBreathPhaseIdx(0);
            setCycle(0);
            const firstPhase = breathingPhases[0];
            speak(firstPhase.instruction);
            return firstPhase.duration;
          } else if (session.kind === 'timeline' && timelineSteps) {
            setPhase('active');
            setStepIdx(0);
            speak(timelineSteps[0].text);
            return timelineSteps[0].duration;
          }
          return prev;
        }

        if (phase === 'active') {
          if (session.kind === 'breathing' && breathingPhases) {
            const nextIdx = breathPhaseIdx + 1;
            if (nextIdx < breathingPhases.length) {
              setBreathPhaseIdx(nextIdx);
              const nextPhase = breathingPhases[nextIdx];
              speak(nextPhase.instruction);
              return nextPhase.duration;
            } else {
              // Completed one full cycle
              const nextCycle = cycle + 1;
              if (nextCycle < session.cycles) {
                setCycle(nextCycle);
                setBreathPhaseIdx(0);
                const firstPhase = breathingPhases[0];
                speak(firstPhase.instruction);
                return firstPhase.duration;
              } else {
                // All cycles done
                setPhase('outro');
                setTimeLeft(10);
                speak(session.outro);
                return 10;
              }
            }
          } else if (session.kind === 'timeline' && timelineSteps) {
            const nextIdx = stepIdx + 1;
            if (nextIdx < timelineSteps.length) {
              setStepIdx(nextIdx);
              speak(timelineSteps[nextIdx].text);
              return timelineSteps[nextIdx].duration;
            } else {
              handleComplete();
              return 0;
            }
          }
          return prev;
        }

        if (phase === 'outro') {
          handleComplete();
          return 0;
        }

        return prev;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, phase, breathPhaseIdx, cycle, stepIdx, session, breathingPhases, timelineSteps, speak, handleComplete]);

  const togglePause = () => {
    setIsPaused((prev) => {
      if (prev) {
        // Resuming — re-speak current instruction
        if (session.kind === 'breathing' && breathingPhases && phase === 'active') {
          speak(breathingPhases[breathPhaseIdx].instruction);
        } else if (session.kind === 'timeline' && timelineSteps && phase === 'active') {
          speak(timelineSteps[stepIdx].text);
        }
      } else {
        cancel();
      }
      return !prev;
    });
  };

  const progress = computeProgress();

  function computeProgress() {
    if (phase === 'intro') return 0;
    if (phase === 'done') return 100;
    if (session.kind === 'breathing' && breathingPhases) {
      const completedCycles = cycle;
      const phaseProgress = breathingPhases.slice(0, breathPhaseIdx).reduce((s, p) => s + p.duration, 0);
      const currentPhaseElapsed = breathingPhases[breathPhaseIdx]
        ? breathingPhases[breathPhaseIdx].duration - timeLeft
        : 0;
      const totalElapsed =
        completedCycles * breathingPhases.reduce((s, p) => s + p.duration, 0) + phaseProgress + currentPhaseElapsed;
      const totalDuration = breathingPhases.reduce((s, p) => s + p.duration, 0) * session.cycles;
      return Math.min(100, (totalElapsed / totalDuration) * 100);
    }
    if (session.kind === 'timeline' && timelineSteps) {
      const completedSteps = timelineSteps.slice(0, stepIdx).reduce((s, st) => s + st.duration, 0);
      const currentStepElapsed = timelineSteps[stepIdx] ? timelineSteps[stepIdx].duration - timeLeft : 0;
      const totalDuration = timelineSteps.reduce((s, st) => s + st.duration, 0);
      return Math.min(100, ((completedSteps + currentStepElapsed) / totalDuration) * 100);
    }
    return 0;
  }

  const currentBreathPhase: BreathingPhase | null =
    session.kind === 'breathing' && breathingPhases && phase === 'active' ? breathingPhases[breathPhaseIdx] : null;
  const currentStep: SessionStep | null =
    session.kind === 'timeline' && timelineSteps && phase === 'active' ? timelineSteps[stepIdx] : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => {
            cancel();
            onClose();
          }}
          aria-label="Kapat"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{session.title}</h2>
        <button
          onClick={toggleMuted}
          aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      {/* Progress bar */}
      <div className="mx-5 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${theme.gradient} transition-all duration-1000 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {phase === 'intro' && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${theme.gradient} text-white shadow-lg`}
            >
              <Play className="h-10 w-10" fill="currentColor" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{session.title}</p>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">{session.subtitle}</p>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">Hazır olunca başlayacak...</p>
          </div>
        )}

        {phase === 'active' && currentBreathPhase && (
          <BreathingAnimation
            phase={currentBreathPhase}
            phaseIndex={breathPhaseIdx}
            cycle={cycle}
            totalCycles={session.kind === 'breathing' ? session.cycles : 1}
          />
        )}

        {phase === 'active' && currentStep && (
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="text-6xl font-bold text-gray-200 dark:text-gray-700">{timeLeft}</div>
            <p className="max-w-xs text-lg font-medium leading-relaxed text-gray-800 dark:text-gray-200">{currentStep.text}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Adım {stepIdx + 1} / {timelineSteps?.length ?? 0}
            </p>
          </div>
        )}

        {phase === 'outro' && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${theme.gradient} text-white shadow-lg`}
            >
              <Check className="h-10 w-10" />
            </div>
            <p className="max-w-xs text-lg font-medium leading-relaxed text-gray-800 dark:text-gray-200">{session.outro}</p>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <Check className="h-14 w-14 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">Tamamlandı!</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Kendine biraz zaman ayırdığın için teşekkürler.</p>
            </div>
            <button
              onClick={() => {
                cancel();
                onClose();
              }}
              className="mt-2 rounded-full bg-emerald-700 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
            >
              Geri Dön
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      {phase !== 'done' && phase !== 'outro' && (
        <div className="flex items-center justify-center gap-6 pb-10">
          <button
            onClick={togglePause}
            aria-label={isPaused ? 'Devam et' : 'Duraklat'}
            className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${theme.gradient} text-white shadow-lg transition-transform hover:scale-105`}
          >
            {isPaused ? <Play className="h-7 w-7" fill="currentColor" /> : <Pause className="h-7 w-7" fill="currentColor" />}
          </button>
        </div>
      )}
    </div>
  );
}
