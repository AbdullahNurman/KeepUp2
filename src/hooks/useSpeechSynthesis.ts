import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Splits text into small speakable segments at natural pause points.
 * Each segment becomes its own utterance so the voice naturally rises
 * at the start and falls at the end of each phrase, with a pause between.
 */
function buildQueue(text: string): { text: string; pauseAfter: number }[] {
  const queue: { text: string; pauseAfter: number }[] = [];
  const ellipsisParts = text.split(/\.\.\./);

  for (let e = 0; e < ellipsisParts.length; e++) {
    const sentences = ellipsisParts[e]
      .split(/(?<=[.!?])\s+/)
      .flatMap((s) => s.split(/,\s*/))
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (let i = 0; i < sentences.length; i++) {
      let pauseAfter = 200;
      if (i === sentences.length - 1) {
        if (e < ellipsisParts.length - 1) {
          pauseAfter = 600;
        } else if (sentences[i].match(/[.!?]$/)) {
          pauseAfter = 400;
        } else {
          pauseAfter = 300;
        }
      }
      queue.push({ text: sentences[i], pauseAfter });
    }
  }
  return queue;
}

export function useSpeechSynthesis() {
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window);
  const [muted, setMuted] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const queueRef = useRef<{ text: string; pauseAfter: number }[]>([]);
  const isSpeakingRef = useRef(false);
  // Generation counter — any stale onend/timeout callbacks from a
  // previous speak() call check this and bail out.
  const genRef = useRef(0);

  useEffect(() => {
    if (!supported) return;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const trVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('tr'));
      const femaleHints = ['female', 'kadın', 'seda', 'zelihan', 'filiz', 'duygu'];
      voiceRef.current =
        trVoices.find((v) => femaleHints.some((h) => v.name.toLowerCase().includes(h))) ??
        trVoices.find((v) => !v.name.toLowerCase().includes('male')) ??
        trVoices[0] ??
        null;
    };

    pickVoice();
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pickVoice);
  }, [supported]);

  const processQueue = useCallback(() => {
    if (!supported || isSpeakingRef.current || mutedRef.current) return;

    const next = queueRef.current.shift();
    if (!next) return;

    isSpeakingRef.current = true;
    const gen = genRef.current;

    const utterance = new SpeechSynthesisUtterance(next.text);
    utterance.lang = 'tr-TR';
    utterance.rate = 0.72;
    utterance.pitch = 1.06;
    utterance.volume = 0.8;
    if (voiceRef.current) utterance.voice = voiceRef.current;

    utterance.onend = () => {
      isSpeakingRef.current = false;
      if (gen !== genRef.current) return; // stale — a newer speak() took over
      if (queueRef.current.length > 0) {
        setTimeout(() => {
          if (gen !== genRef.current) return;
          processQueue();
        }, next.pauseAfter);
      }
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      if (gen !== genRef.current) return;
      setTimeout(() => {
        if (gen !== genRef.current) return;
        processQueue();
      }, 200);
    };

    window.speechSynthesis.speak(utterance);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || mutedRef.current) return;

      // Invalidate all previous callbacks and cancel current speech
      genRef.current++;
      window.speechSynthesis.cancel();
      queueRef.current = [];
      isSpeakingRef.current = false;

      queueRef.current = buildQueue(text);
      processQueue();
    },
    [supported, processQueue],
  );

  const cancel = useCallback(() => {
    if (!supported) return;
    genRef.current++;
    window.speechSynthesis.cancel();
    queueRef.current = [];
    isSpeakingRef.current = false;
  }, [supported]);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      if (!prev) cancel();
      return !prev;
    });
  }, [cancel]);

  return { supported, speak, cancel, muted, toggleMuted };
}
