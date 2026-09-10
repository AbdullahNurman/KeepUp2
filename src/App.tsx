import { useCallback, useEffect, useState } from 'react';
import { Brain, Dumbbell, Sparkles, GraduationCap, TrendingUp, User, Home } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import { AmbientSoundCard } from '@/components/AmbientSoundCard';
import { AppHeader } from '@/components/AppHeader';
import { StreakCard } from '@/components/StreakCard';
import { MoodSelector } from '@/components/MoodSelector';
import { FeatureCard } from '@/components/FeatureCard';
import { HelpBox } from '@/components/HelpBox';
import { SessionListItem } from '@/components/SessionListItem';
import { GuidedSessionPlayer } from '@/components/GuidedSessionPlayer';
import { GrowthPage } from '@/components/GrowthPage';
import { meditations } from '@/data/meditations';
import { exercises } from '@/data/exercises';
import { GuidedSession } from '@/types/session';
import { ActivityLogRow } from '@/lib/supabase';
import { fetchRecentActivity, logActivity, computeStreak, todaysMood } from '@/lib/activity';

type Screen = { name: 'root' } | { name: 'meditationList' } | { name: 'exerciseList' } | { name: 'session'; session: GuidedSession };

function App() {
  const { isDark, toggleTheme } = useTheme();
  const ambient = useAmbientSound();
  const [screen, setScreen] = useState<Screen>({ name: 'root' });
  const [activeSession, setActiveSession] = useState<GuidedSession | null>(null);
  const [rows, setRows] = useState<ActivityLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState<string | null>(null);
  const [moodSaved, setMoodSaved] = useState(false);

  const loadActivity = useCallback(async () => {
    try {
      const data = await fetchRecentActivity(30);
      setRows(data);
      setMood(todaysMood(data));
    } catch (err) {
      console.error('Failed to load activity:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const handleMoodSelect = useCallback(
    async (moodKey: string) => {
      setMood(moodKey);
      setMoodSaved(true);
      try {
        await logActivity('mood', moodKey);
        await loadActivity();
      } catch (err) {
        console.error('Failed to save mood:', err);
      }
    },
    [loadActivity],
  );

  const handleSessionComplete = useCallback(async () => {
    if (!activeSession) return;
    try {
      await logActivity(activeSession.category, activeSession.id);
      await loadActivity();
    } catch (err) {
      console.error('Failed to log session:', err);
    }
  }, [activeSession, loadActivity]);

  const streak = computeStreak(rows);

  const openSession = (session: GuidedSession) => {
    setActiveSession(session);
    setScreen({ name: 'session', session });
  };

  const closeSession = () => {
    setActiveSession(null);
    setScreen({ name: 'root' });
  };

  if (activeSession) {
    return (
      <GuidedSessionPlayer
        session={activeSession}
        onClose={closeSession}
        onComplete={handleSessionComplete}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <AppHeader
        title="Keep Up"
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      <main className="mx-auto w-full max-w-md flex-1 px-5 py-5">
        <div className="space-y-10">
          {/* HOME SECTION */}
          <section id="home" className="space-y-6 scroll-mt-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Eğitimde yepyeni bir nefese hoş geldin
              </h2>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                Bugün kendine biraz zaman ayır, sakinleş ve odaklan.
              </p>
            </div>

            <StreakCard streak={streak} />

            <MoodSelector selected={mood} onSelect={handleMoodSelect} />
            {moodSaved && mood && (
              <p className="-mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Teşekkürler! Bugün hislerin kaydedildi.
              </p>
            )}

            <AmbientSoundCard
              currentSound={ambient.currentSound}
              volume={ambient.volume}
              onToggle={ambient.toggle}
              onStop={ambient.stop}
              onVolumeChange={ambient.setVolume}
            />

            <div>
              <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">Senin İçin</h2>
              <div className="flex gap-3">
                <FeatureCard
                  label="Meditasyon"
                  description="Sesli rehberli sakinleştirici pratikler"
                  icon={Brain}
                  iconBg="bg-emerald-100"
                  iconColor="text-emerald-700"
                  onClick={() => document.getElementById('meditations')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                />
                <FeatureCard
                  label="Egzersiz"
                  description="Germe ve rahatlama hareketleri"
                  icon={Dumbbell}
                  iconBg="bg-sky-100"
                  iconColor="text-sky-700"
                  onClick={() => document.getElementById('exercises')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 text-white shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-200" />
                <h3 className="font-bold">Günün Tavsiyesi</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-emerald-50">
                Sınav öncesi en iyi yatırım kendine ayırdığın 5 dakikadır. Bugün bir nefes egzersizi dene.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">Yardıma mı ihtiyacın var?</h2>
              <HelpBox />
            </div>
          </section>

          <SectionDivider />

          {/* MEDITATION SECTION */}
          <section id="meditations" className="space-y-4 scroll-mt-20">
            <SectionTitle icon={Brain} title="Meditasyon" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sınav stresini azaltmak için sesli rehberli meditasyonlar. Kulaklık takmanı öneririz.
            </p>
            <div className="space-y-3">
              {meditations.map((meditation) => (
                <SessionListItem key={meditation.id} session={meditation} onSelect={openSession} />
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* EXERCISE SECTION */}
          <section id="exercises" className="space-y-4 scroll-mt-20">
            <SectionTitle icon={Dumbbell} title="Egzersiz" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Zihnini ve bedenini tazelemek için kısa egzersizler. Mola ver, kendini iyi hisset.
            </p>
            <div className="space-y-3">
              {exercises.map((exercise) => (
                <SessionListItem key={exercise.id} session={exercise} onSelect={openSession} />
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* SELECTION SECTION */}
          <section id="selection" className="space-y-4 scroll-mt-20">
            <SectionTitle icon={GraduationCap} title="YKS / LGS Seçimi" />
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
              <GraduationCap className="mx-auto h-14 w-14 text-emerald-400" />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Hazırlık sürecine özel içerikler yakında geliyor. Şimdilik meditasyon ve egzersizlerle sakin kal!
              </p>
            </div>
          </section>

          <SectionDivider />

          {/* GROWTH SECTION */}
          <section id="growth" className="space-y-4 scroll-mt-20">
            <SectionTitle icon={TrendingUp} title="Gelişim" />
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-sm text-gray-400 dark:text-gray-500">Yükleniyor...</p>
              </div>
            ) : (
              <GrowthPage rows={rows} />
            )}
          </section>

          <SectionDivider />

          {/* PROFILE SECTION */}
          <section id="profile" className="space-y-4 scroll-mt-20">
            <SectionTitle icon={User} title="Profil" />
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <GraduationCap className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="mt-3 text-lg font-bold text-gray-900 dark:text-gray-100">Öğrenci Profili</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Kişisel hedefler ve ilerleme takibi yakında. Şimdilik Gelişim bölümünden ilerlemeni görebilirsin.
              </p>
            </div>
          </section>

          {/* Bottom spacer */}
          <div className="h-4" />
        </div>
      </main>

    </div>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Home; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
        <Icon className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
      </span>
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
    </div>
  );
}

export default App;
