import { useEffect, useId, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { ImageWithFallback } from '../ImageWithFallback';

const PRODUCT_VIDEO_PLAY_EVENT = 'pogon:product-video-play';

type ProductVideoProps = {
  src: string;
  mimeType?: string;
  poster: string;
  title: string;
  active?: boolean;
  className?: string;
  fit?: 'cover' | 'contain';
};

export function ProductVideo({ src, mimeType = 'video/mp4', poster, title, active = true, className = '', fit = 'cover' }: ProductVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceId = useId();
  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.55), { threshold: [0, 0.55, 1] });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const pauseThisVideo = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== instanceId) videoRef.current?.pause();
    };
    window.addEventListener(PRODUCT_VIDEO_PLAY_EVENT, pauseThisVideo);
    return () => window.removeEventListener(PRODUCT_VIDEO_PLAY_EVENT, pauseThisVideo);
  }, [instanceId]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) videoRef.current?.pause();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const shouldAutoplay = active && isInView && !prefersReducedMotion && !hasError && !document.hidden;
    if (!shouldAutoplay) {
      video.pause();
      return;
    }
    video.muted = true;
    setIsMuted(true);
    window.dispatchEvent(new CustomEvent(PRODUCT_VIDEO_PLAY_EVENT, { detail: instanceId }));
    void video.play().then(() => setAutoplayBlocked(false)).catch(() => setAutoplayBlocked(true));
  }, [active, hasError, instanceId, isInView, prefersReducedMotion]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video || hasError) return;
    if (video.paused) {
      window.dispatchEvent(new CustomEvent(PRODUCT_VIDEO_PLAY_EVENT, { detail: instanceId }));
      void video.play().then(() => setAutoplayBlocked(false)).catch(() => setAutoplayBlocked(true));
    } else {
      video.pause();
    }
  };

  const toggleMuted = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  if (hasError) {
    return (
      <div ref={containerRef} onClick={(event) => event.stopPropagation()} className={`relative overflow-hidden bg-[#f3f3f1] ${className}`} role="img" aria-label={`${title}. Video temporarily unavailable.`}>
        <ImageWithFallback src={poster} alt="" className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`} />
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm">Video temporarily unavailable</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} onClick={(event) => event.stopPropagation()} className={`group/video relative overflow-hidden bg-[#f3f3f1] ${className}`}>
      <video
        ref={videoRef}
        className={`h-full w-full cursor-pointer ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
        poster={poster}
        preload={active && isInView ? 'metadata' : 'none'}
        muted={isMuted}
        playsInline
        loop
        aria-label={title}
        onClick={togglePlayback}
        onPlay={() => {
          setIsPlaying(true);
          window.dispatchEvent(new CustomEvent(PRODUCT_VIDEO_PLAY_EVENT, { detail: instanceId }));
        }}
        onPause={() => setIsPlaying(false)}
        onVolumeChange={(event) => setIsMuted(event.currentTarget.muted)}
        onError={() => setHasError(true)}
      >
        <source src={src} type={mimeType} />
      </video>

      {(!isPlaying || autoplayBlocked) ? (
        <button type="button" onClick={togglePlayback} aria-label={`Play ${title}`} className="absolute left-1/2 top-1/2 z-10 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/35 bg-black/65 text-white shadow-2xl backdrop-blur-md transition-transform hover:scale-105">
          <Play className="ml-1 size-6 fill-current" />
        </button>
      ) : null}

      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-black/65 p-1.5 text-white shadow-lg backdrop-blur-md opacity-100 transition-opacity sm:opacity-0 sm:group-hover/video:opacity-100 sm:group-focus-within/video:opacity-100">
        <button type="button" onClick={togglePlayback} aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`} className="grid size-9 place-items-center rounded-full hover:bg-white/15">
          {isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
        </button>
        <button type="button" onClick={toggleMuted} aria-label={isMuted ? `Unmute ${title}` : `Mute ${title}`} className="grid size-9 place-items-center rounded-full hover:bg-white/15">
          {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>
    </div>
  );
}
