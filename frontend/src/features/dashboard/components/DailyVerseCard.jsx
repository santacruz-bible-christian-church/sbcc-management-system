import { useState } from 'react';
import { HiBookOpen, HiClipboardCopy, HiCheck } from 'react-icons/hi';
import { getTodaysVerse } from '../data/bibleVerses';

export const DailyVerseCard = () => {
  const [copied, setCopied] = useState(false);
  const verse = getTodaysVerse();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`"${verse.text}" - ${verse.reference}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="lg:col-span-4">
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-3xl p-6 shadow-xl h-full min-h-[280px] flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-shadow border border-amber-100">
        {/* Decorative cross pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4 text-8xl text-sbcc-primary">✝</div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-sbcc-orange rounded-full -ml-16 -mb-16" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-sbcc-primary/10 rounded-full flex items-center justify-center">
                <HiBookOpen className="w-5 h-5 text-sbcc-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-sbcc-primary">Daily Verse</h3>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-sbcc-primary/10 transition-colors group/btn"
              title="Copy verse"
            >
              {copied ? (
                <HiCheck className="w-5 h-5 text-green-600" />
              ) : (
                <HiClipboardCopy className="w-5 h-5 text-gray-400 group-hover/btn:text-sbcc-primary" />
              )}
            </button>
          </div>

          {/* Verse */}
          <div className="flex-1 flex flex-col justify-center">
            <blockquote className="text-gray-700 text-base leading-relaxed italic mb-4">
              "{verse.text}"
            </blockquote>
            <p className="text-sbcc-primary font-semibold text-sm">
              — {verse.reference}
            </p>
          </div>
        </div>

        {/* Subtle cross watermark */}
        <div className="absolute bottom-4 right-4 opacity-10">
          <svg className="w-16 h-16 text-sbcc-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 2v7H4v4h7v9h2v-9h7v-4h-7V2h-2z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DailyVerseCard;
