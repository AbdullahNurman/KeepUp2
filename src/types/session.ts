export type SessionCategory = 'meditation' | 'exercise';

export interface SessionStep {
  text: string;
  duration: number;
}

export interface BreathingPhase {
  label: string;
  instruction: string;
  duration: number;
}

interface GuidedSessionBase {
  id: string;
  category: SessionCategory;
  title: string;
  subtitle: string;
  durationLabel: string;
  accent: 'emerald' | 'sky' | 'amber' | 'rose';
  intro: string;
  outro: string;
}

export interface BreathingSession extends GuidedSessionBase {
  kind: 'breathing';
  phases: BreathingPhase[];
  cycles: number;
}

export interface TimelineSession extends GuidedSessionBase {
  kind: 'timeline';
  steps: SessionStep[];
}

export type GuidedSession = BreathingSession | TimelineSession;
