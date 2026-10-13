/**
 * Manual Jest mock for react-native-svg.
 *
 * Behavior tests assert which Tulip Hero layers and cues exist, never pixel
 * output, so every SVG element renders as a plain View passthrough that
 * keeps testIDs and children.
 */
import React, { type ReactNode } from 'react';
import { View } from 'react-native';

interface StubProps {
  children?: ReactNode;
  [key: string]: unknown;
}

function makeStub(displayName: string) {
  const Stub = ({ children, ...props }: StubProps) => (
    <View {...props}>{children}</View>
  );
  Stub.displayName = displayName;
  return Stub;
}

const Svg = makeStub('Svg');

export default Svg;
export const SvgAst = makeStub('SvgAst');
export const Circle = makeStub('Circle');
export const ClipPath = makeStub('ClipPath');
export const Defs = makeStub('Defs');
export const Ellipse = makeStub('Ellipse');
export const ForeignObject = makeStub('ForeignObject');
export const G = makeStub('G');
export const Image = makeStub('SvgImage');
export const Line = makeStub('Line');
export const LinearGradient = makeStub('LinearGradient');
export const Marker = makeStub('Marker');
export const Mask = makeStub('Mask');
export const Path = makeStub('Path');
export const Pattern = makeStub('Pattern');
export const Polygon = makeStub('Polygon');
export const Polyline = makeStub('Polyline');
export const RadialGradient = makeStub('RadialGradient');
export const Rect = makeStub('Rect');
export const Stop = makeStub('Stop');
export const Symbol = makeStub('Symbol');
export const TSpan = makeStub('TSpan');
export const Text = makeStub('SvgText');
export const TextPath = makeStub('TextPath');
export const Use = makeStub('Use');
