'use client';

import { CalendarCheck, Phone } from 'lucide-react';
import { motion, MotionValue, useMotionValue, useTransform } from 'motion/react';

type HeroCopy = {
  heroTitle: string;
  heroSub: string;
  heroPrimary: string;
  heroSecondary: string;
  range: string;
  power: string;
  topSpeed: string;
  fromText: string;
};

type OverlayProps = {
  scrollProgress?: MotionValue<number>;
  copy?: HeroCopy;
  onBookTestRide?: () => void;
  phoneHref?: string;
  onPhoneClick?: () => void;
};

const fallbackCopy: HeroCopy = {
  heroTitle: 'Pokreni se',
  heroSub: 'Električni bicikli za grad, tempo i planove koji ne čekaju.',
  heroPrimary: 'Zakaži test vožnju',
  heroSecondary: 'Pozovi nas',
  range: 'Domet',
  power: 'Snaga',
  topSpeed: 'Maks. brzina',
  fromText: 'od',
};

export function Overlay({ scrollProgress, copy = fallbackCopy, onBookTestRide, phoneHref = 'tel:+381631505003', onPhoneClick }: OverlayProps) {
  const fallbackProgress = useMotionValue(0);
  const progress = scrollProgress ?? fallbackProgress;
  const opacity = useTransform(progress, [0, 0.08, 0.86, 1], [1, 1, 0.94, 0.7]);
  const titleOpacity = useTransform(progress, [0.06, 0.16], [0, 1]);
  const titleY = useTransform(progress, [0.06, 0.16], [18, 0]);
  const copyOpacity = useTransform(progress, [0.15, 0.25], [0, 1]);
  const copyY = useTransform(progress, [0.15, 0.25], [16, 0]);
  const statsOpacity = useTransform(progress, [0.25, 0.38, 0.82, 1], [0, 1, 1, 0.58]);
  const statsY = useTransform(progress, [0.25, 0.38], [18, 0]);
  const ctaOpacity = useTransform(progress, [0.38, 0.5, 0.86, 1], [0, 1, 1, 0.65]);
  const ctaY = useTransform(progress, [0.38, 0.5], [16, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 pt-20 text-white"
    >
      <motion.div
        className="mx-auto flex w-full max-w-5xl flex-col items-center text-center"
      >
        <motion.h1
          style={{ opacity: titleOpacity, y: titleY }}
          className="max-w-4xl text-7xl font-black uppercase leading-[0.88] tracking-normal text-white lg:text-8xl xl:text-9xl"
        >
          {copy.heroTitle}
        </motion.h1>
        <motion.p
          style={{ opacity: copyOpacity, y: copyY }}
          className="mt-7 max-w-xl text-lg font-light leading-relaxed text-white/72"
        >
          {copy.heroSub}
        </motion.p>

        <motion.div
          style={{ opacity: statsOpacity, y: statsY }}
          className="pointer-events-auto mt-10 grid w-full max-w-3xl grid-cols-3 gap-4 rounded-3xl border border-white/10 bg-black/30 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl"
        >
          {[
            ['100km', copy.range],
            [`${copy.fromText} 250w`, copy.power],
            [`${copy.fromText} 25km/h`, copy.topSpeed],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5">
              <div className="text-3xl font-black leading-none">{value}</div>
              <div className="mt-2 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white/45">{label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div style={{ opacity: ctaOpacity, y: ctaY }} className="pointer-events-auto mt-7 flex gap-3">
          <button type="button" onClick={onBookTestRide} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black transition-transform hover:scale-[1.03] active:scale-[0.98]">
            <CalendarCheck className="size-4" />
            {copy.heroPrimary}
          </button>
          <a href={phoneHref} onClick={onPhoneClick} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-xl transition-colors hover:bg-white/15 active:scale-[0.98]">
            <Phone className="size-4" />
            {copy.heroSecondary}
          </a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
