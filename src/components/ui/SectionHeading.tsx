import React from 'react';

interface SectionHeadingProps {
  /** Frühere Abschnittsnummer; wird nicht mehr angezeigt */
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: 'center' | 'left';
}

/** Einheitliche Abschnitts-Überschrift: Kategorie als Pille, großer Titel, kurzer Einleitungstext */
export const SectionHeading: React.FC<SectionHeadingProps> = ({ eyebrow, title, intro, align = 'center' }) => {
  const centered = align === 'center';
  return (
    <div className={`reveal max-w-3xl mb-10 md:mb-14 ${centered ? 'text-center mx-auto' : ''}`}>
      <span className="eyebrow-pill inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur px-3 py-1 text-xs font-medium text-zinc-300">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_10px_#00F5D4]" />
        {eyebrow}
      </span>
      <h2 className="section-title mt-4 text-[2rem] leading-[1.05] sm:text-5xl lg:text-[3.5rem] font-bold tracking-[-0.035em] text-balance">
        {title}
      </h2>
      {intro && (
        <p className={`mt-4 text-zinc-400 text-base sm:text-lg leading-relaxed text-balance ${centered ? 'max-w-2xl mx-auto' : ''}`}>
          {intro}
        </p>
      )}
    </div>
  );
};
