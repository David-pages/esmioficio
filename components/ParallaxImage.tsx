import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type ParallaxIntensity = 'soft' | 'medium' | 'hero';
type ParallaxRadius = 'none' | 'soft' | 'card';

interface ParallaxImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'className'> {
  className?: string;
  imageClassName?: string;
  intensity?: ParallaxIntensity;
  radius?: ParallaxRadius;
}

const MOTION: Record<ParallaxIntensity, {
  frameMobile: number;
  frameDesktop: number;
  imageMobile: number;
  imageDesktop: number;
  yMobile: number;
  yDesktop: number;
  yEndMobile: number;
  yEndDesktop: number;
  scrub: number;
}> = {
  soft: {
    frameMobile: 0.94,
    frameDesktop: 0.96,
    imageMobile: 1.12,
    imageDesktop: 1.08,
    yMobile: -5,
    yDesktop: -3,
    yEndMobile: 4,
    yEndDesktop: 2,
    scrub: 0.5
  },
  medium: {
    frameMobile: 0.9,
    frameDesktop: 0.94,
    imageMobile: 1.18,
    imageDesktop: 1.12,
    yMobile: -8,
    yDesktop: -5,
    yEndMobile: 6,
    yEndDesktop: 4,
    scrub: 0.65
  },
  hero: {
    frameMobile: 0.88,
    frameDesktop: 0.92,
    imageMobile: 1.24,
    imageDesktop: 1.16,
    yMobile: -10,
    yDesktop: -7,
    yEndMobile: 8,
    yEndDesktop: 5,
    scrub: 0.75
  }
};

const RADIUS: Record<ParallaxRadius, {
  startMobile: string;
  startDesktop: string;
  endMobile: string;
  endDesktop: string;
}> = {
  none: {
    startMobile: '0px',
    startDesktop: '0px',
    endMobile: '0px',
    endDesktop: '0px'
  },
  soft: {
    startMobile: '1rem',
    startDesktop: '1.25rem',
    endMobile: '0.75rem',
    endDesktop: '1rem'
  },
  card: {
    startMobile: '1.5rem',
    startDesktop: '2rem',
    endMobile: '1.15rem',
    endDesktop: '1.5rem'
  }
};

const ParallaxImage: React.FC<ParallaxImageProps> = ({
  className = '',
  imageClassName = '',
  intensity = 'medium',
  radius = 'card',
  loading = 'lazy',
  decoding = 'async',
  alt,
  ...imageProps
}) => {
  const frameRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const image = imageRef.current;

    if (!frame || !image) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      gsap.set([frame, image], { clearProps: 'transform,willChange,borderRadius' });
      return;
    }

    const motion = MOTION[intensity];
    const radiusValue = RADIUS[radius];
    const media = gsap.matchMedia();

    const createAnimation = (isMobile: boolean) => {
      gsap.set(frame, {
        scale: isMobile ? motion.frameMobile : motion.frameDesktop,
        borderRadius: isMobile ? radiusValue.startMobile : radiusValue.startDesktop,
        transformOrigin: '50% 50%',
        willChange: 'transform,border-radius'
      });

      gsap.set(image, {
        scale: isMobile ? motion.imageMobile : motion.imageDesktop,
        yPercent: isMobile ? motion.yMobile : motion.yDesktop,
        transformOrigin: '50% 50%',
        willChange: 'transform'
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: frame,
          start: isMobile ? 'top 94%' : 'top 86%',
          end: isMobile ? 'bottom 12%' : 'bottom 26%',
          scrub: motion.scrub,
          invalidateOnRefresh: true
        }
      });

      timeline
        .to(frame, {
          scale: 1,
          borderRadius: isMobile ? radiusValue.endMobile : radiusValue.endDesktop,
          ease: 'none'
        }, 0)
        .to(image, {
          scale: 1.03,
          yPercent: isMobile ? motion.yEndMobile : motion.yEndDesktop,
          ease: 'none'
        }, 0);

      return () => timeline.kill();
    };

    media.add('(max-width: 767px)', () => createAnimation(true));
    media.add('(min-width: 768px)', () => createAnimation(false));

    return () => {
      media.revert();
      gsap.set([frame, image], { clearProps: 'transform,willChange,borderRadius' });
    };
  }, [intensity, radius]);

  return (
    <figure
      ref={frameRef}
      className={`parallax-image relative block overflow-hidden ${className}`}
    >
      <img
        ref={imageRef}
        alt={alt}
        loading={loading}
        decoding={decoding}
        className={`parallax-image__media h-full w-full object-cover ${imageClassName}`}
        {...imageProps}
      />
    </figure>
  );
};

export default ParallaxImage;
