'use client';

import {Box, type BoxProps, Flex} from '@mantine/core';
import {
  animate,
  type AnimationPlaybackControls,
  motion,
  useMotionValue,
} from 'motion/react';
import {type ReactNode, useCallback, useEffect, useRef} from 'react';

const DRAG_THRESHOLD = 3;
type MarqueeGap = string | number;

export type MarqueeProps = BoxProps & {
  items: ReactNode[];
  reverse?: boolean;
  gap?: MarqueeGap;
  duration?: number;
  showGradient?: boolean;
};

export const Marquee = ({
  items,
  reverse = false,
  duration = 20,
  gap = '1rem',
  showGradient = true,
  ...boxProps
}: MarqueeProps) => {
  const resolvedGap = typeof gap === 'number' ? `${gap}px` : gap;
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragStartX = useRef(0);
  const dragStartValue = useRef(0);

  const startAnimation = useCallback(() => {
    if (!trackRef.current) return;
    const halfWidth = trackRef.current.scrollWidth / 2;
    if (halfWidth === 0) return;

    // Normalize x into [-halfWidth, 0) range
    let cur = x.get() % halfWidth;
    if (cur > 0) cur -= halfWidth;
    if (cur < -halfWidth) cur += halfWidth;

    const target = reverse ? 0 : -halfWidth;

    // If already at target, reset to start of the cycle
    if (Math.abs(target - cur) < 1) {
      cur = reverse ? -halfWidth : 0;
    }

    x.set(cur);

    const distanceToGo = Math.abs(target - cur);
    const adjustedDuration = (distanceToGo / halfWidth) * duration;

    controlsRef.current = animate(x, target, {
      duration: adjustedDuration,
      ease: 'linear',
      onComplete: () => {
        x.set(reverse ? -halfWidth : 0);
        startAnimation();
      },
    });
  }, [x, duration, reverse, items.length]);

  useEffect(() => {
    startAnimation();
    return () => {
      controlsRef.current?.stop();
    };
  }, [startAnimation]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      hasDragged.current = false;
      dragStartX.current = e.clientX;
      dragStartValue.current = x.get();
      controlsRef.current?.stop();
    },
    [x],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - dragStartX.current;
      if (Math.abs(delta) > DRAG_THRESHOLD) hasDragged.current = true;
      x.set(dragStartValue.current + delta);
    },
    [x],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    startAnimation();
  }, [startAnimation]);

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const restartAnimation = useCallback(() => {
    controlsRef.current?.stop();
    startAnimation();
  }, [startAnimation]);

  useEffect(() => {
    if (!trackRef.current) return;
    if (typeof ResizeObserver === 'undefined') return;

    let rafId: number | null = null;
    const observer = new ResizeObserver(() => {
      if (isDragging.current) return;

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        restartAnimation();
      });
    });

    observer.observe(trackRef.current);

    return () => {
      observer.disconnect();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [restartAnimation]);

  const {style: boxStyle, ...restBoxProps} = boxProps;

  return (
    <Box
      {...restBoxProps}
      style={{
        ...boxStyle,
        overflowX: 'hidden',
        cursor: 'grab',
        userSelect: 'none',
        maskImage: showGradient
          ? `linear-gradient(
        to right,
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 1) 20%,
        rgba(0, 0, 0, 1) 80%,
        rgba(0, 0, 0, 0)
      )`
          : undefined,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClickCapture={handleClickCapture}>
      <motion.div ref={trackRef} style={{x, display: 'flex', gap: resolvedGap}}>
        {items.map((item, i) => (
          <Flex key={`a-${i}`} style={{flexShrink: 0}}>
            {item}
          </Flex>
        ))}
        {items.map((item, i) => (
          <Flex key={`b-${i}`} style={{flexShrink: 0}}>
            {item}
          </Flex>
        ))}
      </motion.div>
    </Box>
  );
};
