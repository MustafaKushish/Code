import React from 'react';

interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: 'center' | 'left';
}

/** Einheitliche Abschnitts-Überschrift: Nummer + Kategorie, Titel, kurzer Einleitungstext */
export const SectionHeading: React.FC<SectionHeadingProps> = ({ index, eyebrow, title, intro, align = 'center' }) => {
  const centered = align === 'center';
  return (
    <div className={`reveal max-w-2xl mb-10 md:mb-12 ${centered ? 'text-center mx-auto' : ''}`}>
      <div className={`flex items-center gap-3 mb-3 font-mono text-[11px] uppercase tracking-[0.2em] ${centered ? 'justify-center' : ''}`}>
        <span className="text-[#FF8D4D] font-bold">{index}</span>
        <span className="h-px w-8 bg-gradient-to-r from-[#FF8D4D]/70 to-[#00F5D4]/70" />
        <span className="text-[#00F5D4]">{eyebrow}</span>
      </div>
      <h2 className="text-[1.75rem] leading-tight sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-white text-balance">
        {title}
      </h2>
      {intro && <p className="mt-3 text-[#94A9AA] text-sm sm:text-base leading-relaxed">{intro}</p>}
    </div>
  );
};
