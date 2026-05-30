import { ReactNode } from 'react';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useApp } from '../context/AppContext';

export function ScreenEnter({
  children,
  variant = 'slide',
  delay = 0,
}: {
  children: ReactNode;
  variant?: 'slide' | 'fade';
  delay?: number;
}) {
  const { a11y } = useApp();
  if (a11y.reduceMotion) {
    return <>{children}</>;
  }
  const entering =
    variant === 'fade'
      ? FadeInDown.duration(160).delay(delay)
      : FadeInRight.duration(180).delay(delay);
  return <Animated.View entering={entering} style={{ flex: 1 }}>{children}</Animated.View>;
}
