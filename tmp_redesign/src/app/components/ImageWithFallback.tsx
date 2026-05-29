import { useEffect, useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export function ImageWithFallback({ src, alt, className, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setError(false);
    setCurrentSrc(src);
  }, [src]);

  const handleError = () => {
    const decoded = decodeURI(currentSrc);
    if (decoded !== currentSrc) {
      setCurrentSrc(decoded);
      return;
    }

    setError(true);
  };

  if (error) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
