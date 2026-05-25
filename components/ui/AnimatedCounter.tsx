'use client';

import {Text, type TextProps} from '@mantine/core';
import {useInViewport} from '@mantine/hooks';
import {useEffect, useState} from 'react';

export type AnimatedCounterProps = Omit<TextProps, 'children'> & {
  value: number;
  duration?: number;
  slowdownStepCount?: number;
  prefix?: string;
  suffix?: string;
};

export const AnimatedCounter = ({
  value: endValue,
  duration = 1000,
  slowdownStepCount = 7,
  prefix,
  suffix,
  ...textProps
}: AnimatedCounterProps) => {
  const [currentValue, setCurrentValue] = useState(0);
  const {ref, inViewport} = useInViewport();
  const slowdownStartValue = endValue - slowdownStepCount;

  // First phase (count up to slowdownStartValue)
  useEffect(() => {
    if (!inViewport && currentValue === 0) return () => {};
    if (currentValue >= slowdownStartValue) return () => {};

    const timer = setInterval(() => {
      setCurrentValue((prev) => prev + 1);
      if (currentValue === slowdownStartValue) clearInterval(timer);
    }, duration / endValue);

    return () => clearInterval(timer);
  }, [inViewport, endValue, currentValue, duration, slowdownStartValue]);

  // Second phase (slow down the last steps)
  useEffect(() => {
    if (currentValue < slowdownStartValue) return () => {};
    if (currentValue === endValue) return () => {};

    const timer = setInterval(
      () => {
        setCurrentValue((prev) => prev + 1);
        if (currentValue === endValue) clearInterval(timer);
      },
      2 ** (currentValue - slowdownStartValue) * 15,
    );

    return () => clearInterval(timer);
  }, [endValue, currentValue, slowdownStartValue]);

  return (
    <Text ref={ref} {...textProps}>
      {prefix}
      {currentValue}
      {suffix}
    </Text>
  );
};
