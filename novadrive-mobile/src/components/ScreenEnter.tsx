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
      ? FadeInDown.duration(380).delay(delay)
      : FadeInRight.duration(420).delay(delay).springify().damping(22);
  return <Animated.View entering={entering} style={{ flex: 1 }}>{children}</Animated.View>;
}
