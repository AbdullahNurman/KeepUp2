import { useState } from 'react';
import { Send, HeartHandshake } from 'lucide-react';

const supportiveReplies = [
  'Az önce yazdığın için teşekkürler. Derin bir nefes almaya ne dersin? Meditasyon sekmesinde 4-4-7 nefes tekniği tam sana göre.',
  'Zor hissetmen çok normal. Küçük bir mola ver, Egzersizler sekmesindeki germe hareketlerine göz at.',
  'Yalnız değilsin. Bir dakikanı ayırıp Kısa Farkındalık Molası meditasyonunu dener misin?',
  'Bugün yeterince iyisin. İstersen Sınav Öncesi Sakinleşme meditasyonu ile zihnini toparlayabilirsin.',
];

export function HelpBox() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState<string | null>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    setReply(supportiveReplies[Math.floor(Math.random() * supportiveReplies.length)]);
    setMessage('');
  };

  return (
    <div className="space-y-2">
      {reply && (
        <div className="flex items-start gap-2 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
          <HeartHandshake className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p>{reply}</p>
        </div>
      )}
      <div className="flex items-center gap-2 rounded-full bg-gray-100 p-1.5 pl-4 dark:bg-gray-800">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Yardım ister misin?"
          className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-200 dark:placeholder:text-gray-500"
        />
        <button
          onClick={handleSend}
          aria-label="Gönder"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white transition-colors hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
