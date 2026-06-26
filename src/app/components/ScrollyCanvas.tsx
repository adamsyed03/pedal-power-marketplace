'use client';

import { cloneElement, isValidElement, ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMotionValue } from 'motion/react';

type ScrollyCanvasProps = {
  children: ReactNode;
  frameCount?: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const sourceFrameCount = 60;

const framePath = (index: number) => `/sequence/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`;

export function ScrollyCanvas({ children, frameCount = 20 }: ScrollyCanvasProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRequestRef = useRef(0);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const fallbackSrc = framePath(0);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const scrollProgress = useMotionValue(0);

  const frames = useMemo(
    () => Array.from({ length: frameCount }, (_, index) => {
      const sourceIndex = Math.round((index * (sourceFrameCount - 1)) / Math.max(1, frameCount - 1));
      return framePath(sourceIndex);
    }),
    [frameCount],
  );

  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const width = window.innerWidth;
    const height = window.visualViewport?.height || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.round(width * dpr);
    const nextHeight = Math.round(height * dpr);

    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return { canvas, ctx, width, height };
  }, []);

  const drawFrame = useCallback((frameIndex: number) => {
    const sized = sizeCanvas();
    const image = imagesRef.current[frameIndex] ?? imagesRef.current[currentFrameRef.current] ?? imagesRef.current[0];
    if (!sized || !image || image.naturalWidth === 0 || image.naturalHeight === 0) return;

    const { ctx, width, height } = sized;
    ctx.clearRect(0, 0, width, height);

    const coverScale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * coverScale;
    const drawHeight = image.naturalHeight * coverScale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;

    ctx.drawImage(image, x, y, drawWidth, drawHeight);
    currentFrameRef.current = frameIndex;
    setIsCanvasReady(true);
  }, [sizeCanvas]);

  const updateFromScroll = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const sectionHeight = section.offsetHeight;
    const progress = clamp(-rect.top / Math.max(1, sectionHeight - viewportHeight), 0, 1);
    const frameIndex = Math.min(frameCount - 1, Math.floor(progress * (frameCount - 1)));

    scrollProgress.set(progress);
    targetFrameRef.current = frameIndex;
    drawFrame(frameIndex);
  }, [drawFrame, frameCount, scrollProgress]);

  useEffect(() => {
    let cancelled = false;
    let preloadTimer = 0;
    let nextFrame = 1;
    imagesRef.current = [];

    const loadFrame = (index: number) => new Promise<void>((resolve) => {
      const src = frames[index];
      const image = new Image();
      image.decoding = 'async';
      image.fetchPriority = index === 0 ? 'high' : 'low';
      image.onload = () => {
        if (!cancelled) {
          imagesRef.current[index] = image;
          if (index === 0 || index === targetFrameRef.current) drawFrame(index);
        }
        resolve();
      };
      image.onerror = () => {
        console.warn(`Failed to load scrolly frame: ${src}`);
        resolve();
      };
      image.src = src;
    });

    const loadWorker = async () => {
      while (!cancelled && nextFrame < frames.length) {
        const index = nextFrame++;
        await loadFrame(index);
      }
    };

    void loadFrame(0).then(() => {
      if (!cancelled) {
        preloadTimer = window.setTimeout(() => {
          if (!cancelled) void Promise.all(Array.from({ length: 2 }, loadWorker));
        }, 600);
      }
    });

    return () => {
      cancelled = true;
      window.clearTimeout(preloadTimer);
    };
  }, [drawFrame, frames]);

  useEffect(() => {
    const requestUpdate = () => {
      window.cancelAnimationFrame(frameRequestRef.current);
      frameRequestRef.current = window.requestAnimationFrame(updateFromScroll);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    window.addEventListener('orientationchange', requestUpdate);
    window.visualViewport?.addEventListener('resize', requestUpdate);

    return () => {
      window.cancelAnimationFrame(frameRequestRef.current);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      window.removeEventListener('orientationchange', requestUpdate);
      window.visualViewport?.removeEventListener('resize', requestUpdate);
    };
  }, [updateFromScroll]);

  const overlay = isValidElement(children)
    ? cloneElement(children as ReactElement<{ scrollProgress?: typeof scrollProgress }>, { scrollProgress })
    : children;

  return (
    <section ref={sectionRef} id="top" className="relative h-[200vh] bg-black text-white">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <img
          src={fallbackSrc}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ${isCanvasReady ? 'opacity-0' : 'opacity-100'}`}
        />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute bottom-[6%] right-[4%] z-[5] flex h-28 w-64 items-center justify-center rounded-2xl bg-black/75 shadow-lg backdrop-blur-sm sm:h-32 sm:w-72">
          <img
            src="/Logo.png"
            alt="POGON"
            className="h-full w-full scale-[1.35] object-contain brightness-0 invert"
          />
        </div>
        <div className="absolute inset-0 z-10">
          {overlay}
        </div>
      </div>
    </section>
  );
}
