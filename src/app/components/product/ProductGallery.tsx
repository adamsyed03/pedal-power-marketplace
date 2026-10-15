import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, Expand, Play, X, ZoomIn, ZoomOut } from 'lucide-react';
import { ImageWithFallback } from '../ImageWithFallback';
import { localize, type ProductMedia, type SiteLanguage } from '../../../lib/productDetails';
import type { ProductVideoSource } from '../../../lib/productVideos';
import { ProductVideo } from './ProductVideo';

type ProductGalleryProps = {
  media: ProductMedia[];
  language: SiteLanguage;
  productName: string;
  video?: ProductVideoSource;
};

type GalleryItem =
  | { kind: 'image'; image: ProductMedia }
  | { kind: 'video'; video: ProductVideoSource; poster: string };

export function ProductGallery({ media, language, productName, video }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const poster = media[0]?.src ?? '';
  const items: GalleryItem[] = media.flatMap((image, index) => index === 0 && video
    ? [{ kind: 'image' as const, image }, { kind: 'video' as const, video, poster }]
    : [{ kind: 'image' as const, image }]);
  const active = items[activeIndex] ?? items[0];
  const controls = {
    sr: { previous: 'Prethodna fotografija', next: 'Sledeća fotografija', open: 'Otvori pregled fotografije', show: 'Prikaži fotografiju', gallery: 'Galerija fotografija', zoomOut: 'Umanji', zoomIn: 'Uvećaj', close: 'Zatvori pregled fotografije' },
    en: { previous: 'Previous image', next: 'Next image', open: 'Open image viewer', show: 'Show image', gallery: 'Image gallery', zoomOut: 'Zoom out', zoomIn: 'Zoom in', close: 'Close image viewer' },
    ru: { previous: 'Предыдущее фото', next: 'Следующее фото', open: 'Открыть просмотр фотографий', show: 'Показать фото', gallery: 'Галерея фотографий', zoomOut: 'Уменьшить', zoomIn: 'Увеличить', close: 'Закрыть просмотр фотографий' },
  }[language];

  const show = (index: number) => {
    setActiveIndex((index + items.length) % items.length);
    setZoom(1);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsLightboxOpen(false);
      if (event.key === 'ArrowLeft') show(activeIndex - 1);
      if (event.key === 'ArrowRight') show(activeIndex + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [activeIndex, isLightboxOpen, items.length]);

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 42) return;
    show(activeIndex + (delta < 0 ? 1 : -1));
  };

  if (!active) return null;

  return (
    <>
      <div className="min-w-0 lg:sticky lg:top-20">
        <div
          className="group relative aspect-[4/5] overflow-hidden border border-black/10 bg-[#f3f3f1] sm:aspect-[5/4] lg:aspect-square"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {active.kind === 'video' ? <ProductVideo src={active.video.src} mimeType={active.video.mimeType} poster={active.poster} title={active.video.title} className="h-full w-full" /> : <ImageWithFallback
            src={active.image.src}
            alt={localize(active.image.alt, language)}
            width={active.image.width}
            height={active.image.height}
            decoding="async"
            className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.012]"
          />}
          <div className="absolute inset-x-3 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between sm:inset-x-5">
            <button type="button" onClick={() => show(activeIndex - 1)} aria-label={`${controls.previous}: ${productName}`} className="inline-grid size-11 place-items-center border border-black/15 bg-white/90 text-black shadow-sm transition-colors hover:border-black hover:bg-white">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => show(activeIndex + 1)} aria-label={`${controls.next}: ${productName}`} className="inline-grid size-11 place-items-center border border-black/15 bg-white/90 text-black shadow-sm transition-colors hover:border-black hover:bg-white">
              <ChevronRight className="size-5" />
            </button>
          </div>
          {active.kind === 'image' ? <button type="button" onClick={() => setIsLightboxOpen(true)} aria-label={`${controls.open}: ${productName}`} className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 border border-black/15 bg-white/90 px-3 py-2 text-[0.66rem] font-black uppercase tracking-[0.12em] text-black shadow-sm transition-colors hover:border-black hover:bg-white">
            <Expand className="size-4" />
            <span className="hidden sm:inline">{language === 'sr' ? 'Uvećaj' : language === 'en' ? 'Zoom' : 'Увеличить'}</span>
          </button> : null}
          <div className="absolute bottom-4 left-4 z-20 border border-black/10 bg-white/90 px-3 py-1.5 text-xs font-black text-black shadow-sm">
            {activeIndex + 1} / {items.length}
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item, index) => (
            <button
              key={item.kind === 'video' ? `video-${item.video.src}` : item.image.src}
              type="button"
              onClick={() => show(index)}
              aria-label={item.kind === 'video' ? `Play ${item.video.title}` : `${controls.show}: ${productName} ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              className={`relative aspect-square w-[4.5rem] flex-none overflow-hidden border bg-[#f3f3f1] p-0.5 transition-all sm:w-[4.75rem] ${index === activeIndex ? 'border-black shadow-[inset_0_-3px_0_#7fff00]' : 'border-black/10 opacity-65 hover:border-black/40 hover:opacity-100'}`}
            >
              {item.kind === 'video'
                ? <><ImageWithFallback src={item.poster} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover object-center" /><span className="absolute inset-0 grid place-items-center bg-black/20 text-white"><span className="grid size-8 place-items-center rounded-full bg-black/70"><Play className="ml-0.5 size-3.5 fill-current" /></span></span></>
                : <ImageWithFallback src={item.image.src} alt="" width={item.image.width} height={item.image.height} loading="lazy" decoding="async" className="h-full w-full object-cover object-center" />}
            </button>
          ))}
        </div>
      </div>

      {isLightboxOpen ? (
        <div className="fixed inset-0 z-[120] flex flex-col bg-black/95 text-white" role="dialog" aria-modal="true" aria-label={`${productName}: ${controls.gallery}`}>
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
            <div>
              <p className="font-black">{productName}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">{activeIndex + 1} / {items.length}</p>
            </div>
            <div className="flex items-center gap-2">
              {active.kind === 'image' ? <><button type="button" onClick={() => setZoom((value) => Math.max(1, value - 0.25))} disabled={zoom <= 1} aria-label={controls.zoomOut} className="inline-grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 disabled:opacity-35"><ZoomOut className="size-4" /></button>
              <button type="button" onClick={() => setZoom((value) => Math.min(2, value + 0.25))} disabled={zoom >= 2} aria-label={controls.zoomIn} className="inline-grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 disabled:opacity-35"><ZoomIn className="size-4" /></button></> : null}
              <button type="button" onClick={() => setIsLightboxOpen(false)} aria-label={controls.close} className="inline-grid size-10 place-items-center rounded-full border border-white/20 bg-white/10"><X className="size-5" /></button>
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-4 sm:p-10">
            <button type="button" onClick={() => show(activeIndex - 1)} aria-label={controls.previous} className="absolute left-3 z-10 inline-grid size-11 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm sm:left-6"><ChevronLeft className="size-6" /></button>
            {active.kind === 'video'
              ? <ProductVideo src={active.video.src} mimeType={active.video.mimeType} poster={active.poster} title={active.video.title} active={isLightboxOpen} className="h-full w-full" />
              : <ImageWithFallback src={active.image.src} alt={localize(active.image.alt, language)} width={active.image.width} height={active.image.height} className="max-h-full max-w-full object-contain transition-transform duration-200" style={{ transform: `scale(${zoom})` }} />}
            <button type="button" onClick={() => show(activeIndex + 1)} aria-label={controls.next} className="absolute right-3 z-10 inline-grid size-11 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm sm:right-6"><ChevronRight className="size-6" /></button>
          </div>
        </div>
      ) : null}
    </>
  );
}
