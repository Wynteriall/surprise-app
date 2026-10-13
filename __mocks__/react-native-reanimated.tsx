/**
 * Manual Jest mock for react-native-reanimated.
 *
 * The real module (plus react-native-worklets) needs native code that Jest
 * cannot load, so behavior tests render against this synchronous stand-in:
 * shared values are plain holders and timing helpers resolve immediately.
 * Tulip Hero assertions target external behavior (stage reached, cue fired
 * once), never animation frames, so the simplification is sound.
 */
import React, { type ReactNode } from 'react';
import { Text, View } from 'react-native';

interface StubProps {
  children?: ReactNode;
  [key: string]: unknown;
}

function makeAnimated(displayName: string, Host: React.ElementType) {
  const Stub = ({ children, ...props }: StubProps) => (
    <Host {...props}>{children}</Host>
  );
  Stub.displayName = displayName;
  return Stub;
}

const Animated = {
  View: makeAnimated('Animated.View', View),
  Text: makeAnimated('Animated.Text', Text),
};

export default Animated;

export function useSharedValue<T>(initial: T): { value: T } {
  return { value: initial };
}

export function useAnimatedStyle<T>(updater: () => T): T {
  return updater();
}

export function withTiming<T>(value: T): T {
  return value;
}

export function withSpring<T>(value: T): T {
  return value;
}

export function withDelay<T>(_delay: number, value: T): T {
  return value;
}
