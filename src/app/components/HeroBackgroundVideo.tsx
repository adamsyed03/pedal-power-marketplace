import { useEffect, useRef, useState } from 'react';
import { publicAsset } from '../../lib/assets';
import { ImageWithFallback } from './ImageWithFallback';

export const HERO_BACKGROUND_VIDEO_URL = 'https://pub-a596780795d544d0ae581ceaebbb8e46.r2.dev/website%20landing%20page.mp4';

type HeroBackgroundVideoProps = {
  mediaQuery: string;
  className: string;
  alt: string;
};

type NetworkInformation = {
  effectiveType?: string;
  saveData?: boolean;
};

export function HeroBackgroundVideo({ mediaQuery, className, alt }: HeroBackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);
  const poster = publicAsset('Excellent4.optimized.jpg');

  useEffect(() => {
    const viewport = window.matchMedia(mediaQuery);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    let loadTimer: number | undefined;

    const stopVideo = () => {
      window.clearTimeout(loadTimer);
      setIsPlaying(false);
      setVideoSrc(undefined);
      const video = videoRef.current;
      if (!video) return;
      video.pause();
      video.removeAttribute('src');
      video.load();
    };

    const scheduleVideo = () => {
      window.clearTimeout(loadTimer);
      if (!viewport.matches || reducedMotion.matches || connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType ?? '')) {
        stopVideo();
        return;
      }
      // Preserve the poster as LCP, then begin streaming the large R2 asset.
      loadTimer = window.setTimeout(() => setVideoSrc(HERO_BACKGROUND_VIDEO_URL), 450);
    };

    if (document.readyState === 'complete') scheduleVideo();
    else window.addEventListener('load', scheduleVideo, { once: true });
    viewport.addEventListener('change', scheduleVideo);
    reducedMotion.addEventListener('change', scheduleVideo);

    return () => {
      window.removeEventListener('load', scheduleVideo);
      viewport.removeEventListener('change', scheduleVideo);
      reducedMotion.removeEventListener('change', scheduleVideo);
      window.clearTimeout(loadTimer);
    };
  }, [mediaQuery]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    const syncPlayback = () => {
      if (document.visibilityState === 'visible') void video.play().catch(() => setIsPlaying(false));
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && document.visibilityState === 'visible') void video.play().catch(() => setIsPlaying(false));
      else video.pause();
    }, { threshold: 0.15 });

    observer.observe(video);
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      video.pause();
    };
  }, [videoSrc]);

  return (
    <>
      <ImageWithFallback
        src={poster}
        alt={alt}
        width={1448}
        height={1086}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className={className}
      />
      <video
        ref={videoRef}
        src={videoSrc}
        poster={poster}
        muted
        autoPlay
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setIsPlaying(true)}
        onError={() => setIsPlaying(false)}
        className={`${className} transition-opacity duration-700 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  );
}
